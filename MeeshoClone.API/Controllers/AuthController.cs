using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MongoDbContext _context;

    public AuthController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.CaptchaToken))
        {
            return BadRequest(new { success = false, error = "Captcha is required" });
        }

        var existingUser = await _context.Users.Find(u => u.Email.ToLower() == request.Email.ToLower()).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            return BadRequest(new { success = false, error = "Email already registered" });
        }

        var newUser = new User
        {
            Id = null,
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            Password = HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = request.Role ?? "Normal",
            IsPremier = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true,
            FailedLoginAttempts = 0,
            LockoutUntil = null,
            ResetToken = null,
            ResetTokenExpiry = null
        };

        await _context.Users.InsertOneAsync(newUser);

        return Ok(new { success = true, user = new { id = newUser.Id, fullName = newUser.FullName, email = newUser.Email, role = newUser.Role, isPremier = newUser.IsPremier } });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.CaptchaToken))
        {
            return BadRequest(new { success = false, error = "Captcha is required" });
        }

        var user = await _context.Users.Find(u => u.Email.ToLower() == request.Email.ToLower()).FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest(new { success = false, error = "User not found" });
        }

        if (!user.IsActive)
        {
            return BadRequest(new { success = false, error = "Account is deactivated" });
        }

        // Check if account is locked
        if (user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow)
        {
            var remainingTime = (user.LockoutUntil.Value - DateTime.UtcNow).TotalMinutes;
            return BadRequest(new { success = false, error = $"Account is locked. Try again in {Math.Ceiling(remainingTime)} minutes." });
        }

        if (!VerifyPassword(request.Password, user.Password))
        {
            user.FailedLoginAttempts++;
            
            // Lock account after 5 failed attempts
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(30); // 30 minute lockout
            }
            
            user.UpdatedAt = DateTime.UtcNow;
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
            
            if (user.LockoutUntil.HasValue)
            {
                return BadRequest(new { success = false, error = "Account locked due to too many failed attempts. Please try again in 30 minutes." });
            }
            
            return BadRequest(new { success = false, error = $"Invalid password. {5 - user.FailedLoginAttempts} attempts remaining." });
        }

        // Reset failed attempts on successful login
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(new { success = true, user = new { id = user.Id, fullName = user.FullName, email = user.Email, role = user.Role, isPremier = user.IsPremier, premierExpiryDate = user.PremierExpiryDate } });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _context.Users.Find(u => u.Email.ToLower() == request.Email.ToLower()).FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest(new { success = false, error = "User not found" });
        }

        // Generate reset token
        var resetToken = Guid.NewGuid().ToString() + "-" + Guid.NewGuid().ToString();
        user.ResetToken = resetToken;
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
        user.UpdatedAt = DateTime.UtcNow;

        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        // In a real application, send email with reset link
        // For now, return the token for testing
        return Ok(new { success = true, message = "Password reset token sent to email", resetToken });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await _context.Users.Find(u => u.ResetToken == request.Token).FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest(new { success = false, error = "Invalid reset token" });
        }

        if (!user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry < DateTime.UtcNow)
        {
            return BadRequest(new { success = false, error = "Reset token has expired" });
        }

        user.Password = HashPassword(request.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(new { success = true, message = "Password reset successfully" });
    }

    [HttpPost("generate-captcha")]
    public ActionResult GenerateCaptcha()
    {
        var captchaText = GenerateRandomString(6);
        var captchaToken = Guid.NewGuid().ToString();
        
        // In a real application, store this in cache with expiry
        // For now, return it directly
        return Ok(new { success = true, captchaText, captchaToken });
    }

    [HttpPost("verify-captcha")]
    public ActionResult VerifyCaptcha([FromBody] CaptchaRequest request)
    {
        // In a real application, verify against stored captcha
        // For now, accept any 6-character string
        if (string.IsNullOrEmpty(request.CaptchaText) || request.CaptchaText.Length != 6)
        {
            return BadRequest(new { success = false, error = "Invalid captcha" });
        }

        return Ok(new { success = true, message = "Captcha verified" });
    }

    [HttpPost("upgrade-premier")]
    public async Task<ActionResult> UpgradeToPremier([FromBody] UpgradePremierRequest request)
    {
        var user = await _context.Users.Find(u => u.Id == request.UserId).FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest(new { success = false, error = "User not found" });
        }

        user.IsPremier = true;
        user.PremierExpiryDate = DateTime.UtcNow.AddDays(365); // 1 year
        user.UpdatedAt = DateTime.UtcNow;

        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(new { success = true, message = "Successfully upgraded to premier membership" });
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private bool VerifyPassword(string password, string hash)
    {
        var computedHash = HashPassword(password);
        return computedHash == hash;
    }

    private string GenerateRandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string CaptchaToken { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string CaptchaToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class CaptchaRequest
{
    public string CaptchaText { get; set; } = string.Empty;
    public string CaptchaToken { get; set; } = string.Empty;
}

public class UpgradePremierRequest
{
    public string UserId { get; set; } = string.Empty;
}
