namespace HappyShoppingClone.API.Models;

public class SiteConfiguration
{
    public string? Id { get; set; }
    public string SiteName { get; set; } = "HappyShopping Clone";
    public string SiteDescription { get; set; } = "Your one-stop shop for everything you need";
    public SiteSection Site { get; set; } = new();
    public HeaderConfiguration Header { get; set; } = new();
    public FooterConfiguration Footer { get; set; } = new();
    public ThemeConfiguration? Theme { get; set; }
    public ValidationConfiguration? Validation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SiteSection
{
    public string Name { get; set; } = "HappyShopping Clone";
    public string Description { get; set; } = "Your one-stop shop for everything you need";
    public string HeroImage { get; set; } = string.Empty;
    public string HeroImageBase64 { get; set; } = string.Empty;
    public List<string> SlideshowImages { get; set; } = new();
    public List<string> SlideshowImagesBase64 { get; set; } = new();
    public bool EnableSlideshow { get; set; } = false;
    public int BasicInfoOrder { get; set; } = 1;
    public int HeroImageOrder { get; set; } = 2;
    public int SlideshowOrder { get; set; } = 3;
}

public class HeaderConfiguration
{
    public string Logo { get; set; } = string.Empty;
    public string LogoBase64 { get; set; } = string.Empty;
    public string LogoText { get; set; } = "HappyShopping";
    public string BackgroundColor { get; set; } = "#EC4899";
    public string BackgroundColorEnd { get; set; } = "#8B5CF6";
    public string TextColor { get; set; } = "#FFFFFF";
    public List<HeaderLink> Links { get; set; } = new();
    public List<HeaderIcon> Icons { get; set; } = new();
    public string MobileMenuIcon { get; set; } = string.Empty;
    public string MobileMenuIconBase64 { get; set; } = string.Empty;
    public int LogoBrandingOrder { get; set; } = 1;
    public int SearchSettingsOrder { get; set; } = 2;
    public bool ShowSearchIcon { get; set; } = false;
    public bool ShowLoginIcon { get; set; } = false;
    public bool ShowCartIcon { get; set; } = false;
    public int CustomIconsOrder { get; set; } = 4;
}

public class HeaderLink
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
    public bool OpenInNewTab { get; set; } = false;
    public string Icon { get; set; } = string.Empty;
    public string IconBase64 { get; set; } = string.Empty;
    public List<HeaderSubmenu> Submenus { get; set; } = new();
}

public class HeaderSubmenu
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
    public bool OpenInNewTab { get; set; } = false;
}

public class HeaderIcon
{
    public string Icon { get; set; } = string.Empty;
    public string IconBase64 { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
    public bool IsMobile { get; set; } = true;
    public bool IsDesktop { get; set; } = true;
}

public class FooterConfiguration
{
    // Company Section
    public string CompanyName { get; set; } = "HappyShopping Clone";
    public string CompanyDescription { get; set; } = "Your trusted e-commerce platform";
    public List<SocialNetworkLink> SocialLinks { get; set; } = new();
    public int CompanyInfoOrder { get; set; } = 1;
    
    // Business Links
    public List<BusinessLink> BusinessLinks { get; set; } = new();
    public int BusinessLinksOrder { get; set; } = 2;
    
    // Contact Us
    public List<ContactFieldNew> ContactFields { get; set; } = new();
    public int ContactUsOrder { get; set; } = 3;
    
    // Copyright Section
    public string CopyrightText { get; set; } = "© 2024 HappyShopping Clone. All rights reserved.";
    public List<CopyrightLinkNew> CopyrightLinks { get; set; } = new();
    public int CopyrightSectionOrder { get; set; } = 4;
    
    // Color Settings
    public string BackgroundColor { get; set; } = "#1F2937";
    public string BackgroundColorEnd { get; set; } = "#111827";
    public string TextColor { get; set; } = "#FFFFFF";
    
    // Legacy fields for backward compatibility
    public string Logo { get; set; } = string.Empty;
    public string LogoBase64 { get; set; } = string.Empty;
    public List<SocialMediaLink> SocialLinksLegacy { get; set; } = new();
    public List<ContactField> ContactFieldsLegacy { get; set; } = new();
    public List<FooterSection> Sections { get; set; } = new();
    public List<CopyrightLink> CopyrightLinksLegacy { get; set; } = new();
}

public class SocialMediaLink
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string IconBase64 { get; set; } = string.Empty;
    public bool IsVisible { get; set; } = true;
    public int Order { get; set; }
}

public class ContactField
{
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "text"; // text, email, phone, address
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
}

public class FooterSection
{
    public string Title { get; set; } = string.Empty;
    public List<FooterLink> Links { get; set; } = new();
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
}

public class FooterLink
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool OpenInNewTab { get; set; } = false;
    public string Icon { get; set; } = string.Empty;
    public string IconBase64 { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
}

public class CopyrightLink
{
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool OpenInNewTab { get; set; } = false;
    public int Order { get; set; }
    public bool IsVisible { get; set; } = true;
}

public class ThemeConfiguration
{
    public string PrimaryColor { get; set; } = "#EC4899";
    public string SecondaryColor { get; set; } = "#8B5CF6";
    public string AccentColor { get; set; } = "#F59E0B";
    public string BackgroundColor { get; set; } = "#FFFFFF";
    public string TextColor { get; set; } = "#1F2937";
    public bool IsDarkMode { get; set; } = false;
}

public class SocialNetworkLink
{
    public string Icon { get; set; } = string.Empty;
    public string IconLinkUrl { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
}

public class BusinessLink
{
    public string Name { get; set; } = string.Empty;
    public string LinkUrl { get; set; } = string.Empty;
}

public class CopyrightLinkNew
{
    public string Icon { get; set; } = string.Empty;
    public string LinkText { get; set; } = string.Empty;
    public string LinkUrl { get; set; } = string.Empty;
}

public class ContactFieldNew
{
    public string Icon { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class ValidationConfiguration
{
    public AddressValidation Address { get; set; } = new();
    public PaymentValidation Payment { get; set; } = new();
}

public class AddressValidation
{
    public int FullNameMinLength { get; set; } = 2;
    public int FullNameMaxLength { get; set; } = 100;
    public string FullNamePattern { get; set; } = "^[a-zA-Z\\s\\-']+$";
    
    public int PhoneNumberMinLength { get; set; } = 10;
    public int PhoneNumberMaxLength { get; set; } = 10;
    public string PhoneNumberPattern { get; set; } = "^[6-9]\\d{9}$";
    
    public int AddressLine1MinLength { get; set; } = 5;
    public int AddressLine1MaxLength { get; set; } = 200;
    
    public int AddressLine2MaxLength { get; set; } = 200;
    
    public int CityMinLength { get; set; } = 2;
    public int CityMaxLength { get; set; } = 50;
    public string CityPattern { get; set; } = "^[a-zA-Z\\s\\-']+$";
    
    public int StateMinLength { get; set; } = 2;
    public int StateMaxLength { get; set; } = 50;
    public string StatePattern { get; set; } = "^[a-zA-Z\\s\\-']+$";
    
    public int PinCodeMinLength { get; set; } = 6;
    public int PinCodeMaxLength { get; set; } = 6;
    public string PinCodePattern { get; set; } = "^\\d{6}$";
    
    public List<string> AddressTypes { get; set; } = new() { "Home", "Office", "Other" };
}

public class PaymentValidation
{
    public string UpiIdPattern { get; set; } = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$";
    
    public int CardNumberMinLength { get; set; } = 16;
    public int CardNumberMaxLength { get; set; } = 16;
    public string CardNumberPattern { get; set; } = "^\\d{16}$";
    
    public int CardHolderNameMinLength { get; set; } = 2;
    public int CardHolderNameMaxLength { get; set; } = 100;
    public string CardHolderNamePattern { get; set; } = "^[a-zA-Z\\s\\-']+$";
    
    public string CardExpiryPattern { get; set; } = "^(0[1-9]|1[0-2])/\\d{2}$";
    
    public List<string> BankNames { get; set; } = new() { "SBI", "HDFC", "ICICI", "Axis", "Kotak", "Other" };
}
