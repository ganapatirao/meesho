namespace MeeshoClone.API.Models;

public class SiteConfiguration
{
    public string? Id { get; set; }
    public string SiteName { get; set; } = "Meesho Clone";
    public string SiteDescription { get; set; } = "Your one-stop shop for everything you need";
    public HeaderConfiguration Header { get; set; } = new();
    public FooterConfiguration Footer { get; set; } = new();
    public List<NavigationItem> NavigationItems { get; set; } = new();
    public List<SocialMediaLink> SocialMediaLinks { get; set; } = new();
    public ThemeConfiguration Theme { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class HeaderConfiguration
{
    public string Logo { get; set; } = string.Empty;
    public string LogoBase64 { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = "from-pink-500 to-purple-600";
    public string TextColor { get; set; } = "white";
    public bool ShowSearch { get; set; } = true;
    public bool ShowCart { get; set; } = true;
    public bool ShowWishlist { get; set; } = true;
    public bool ShowDownloadApp { get; set; } = true;
    public bool ShowBecomeSupplier { get; set; } = true;
}

public class FooterConfiguration
{
    public string CompanyName { get; set; } = "Meesho Clone";
    public string Description { get; set; } = "Your trusted e-commerce platform";
    public string Email { get; set; } = "support@meeshoclone.com";
    public string Phone { get; set; } = "+91 1234567890";
    public string Address { get; set; } = "123 Business Street, City, State, India";
    public List<FooterSection> Sections { get; set; } = new();
    public List<string> PaymentMethods { get; set; } = new();
    public string CopyrightText { get; set; } = "© 2024 Meesho Clone. All rights reserved.";
}

public class FooterSection
{
    public string Title { get; set; } = string.Empty;
    public List<FooterLink> Links { get; set; } = new();
}

public class FooterLink
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool OpenInNewTab { get; set; } = false;
}

public class NavigationItem
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
}

public class SocialMediaLink
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsVisible { get; set; } = true;
}

public class ThemeConfiguration
{
    public string PrimaryColor { get; set; } = "#8B5CF6";
    public string SecondaryColor { get; set; } = "#EC4899";
    public string AccentColor { get; set; } = "#F59E0B";
    public string BackgroundGradient { get; set; } = "from-blue-50 to-purple-50";
    public bool DarkModeEnabled { get; set; } = false;
}
