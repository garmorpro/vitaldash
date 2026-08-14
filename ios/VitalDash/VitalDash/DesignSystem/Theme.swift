import SwiftUI

// Mirrors the CSS custom properties in the web app's globals.css
// ("Soft Clinical" palette) so the native app reads as the same product,
// not a reskin. Keep these two files in sync if the web palette changes.
extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }

    init(light: Color, dark: Color) {
        self.init(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

enum VDColor {
    static let ground = Color(light: Color(hex: 0xEEF4F7), dark: Color(hex: 0x10161B))
    static let surface = Color(light: Color(hex: 0xFFFFFF), dark: Color(hex: 0x19222A))
    static let surface2 = Color(light: Color(hex: 0xF1F6F8), dark: Color(hex: 0x212B34))
    static let border = Color(light: Color(hex: 0x143C50, alpha: 0.10), dark: Color(hex: 0xFFFFFF, alpha: 0.09))

    static let ink = Color(light: Color(hex: 0x1B2A33), dark: Color(hex: 0xE7EEF2))
    static let inkMuted = Color(light: Color(hex: 0x5A6E78), dark: Color(hex: 0x9BAAB3))
    static let inkFaint = Color(light: Color(hex: 0x8FA3AC), dark: Color(hex: 0x66757E))

    static let weight = Color(light: Color(hex: 0x1B7FAD), dark: Color(hex: 0x3D93C4))
    static let weightSoft = Color(light: Color(hex: 0x1B7FAD, alpha: 0.12), dark: Color(hex: 0x3D93C4, alpha: 0.18))
    static let weightStrong = Color(light: Color(hex: 0x146485), dark: Color(hex: 0x6BB3DE))

    static let steps = Color(light: Color(hex: 0xC97A2E), dark: Color(hex: 0xC27B37))
    static let stepsSoft = Color(light: Color(hex: 0xC97A2E, alpha: 0.14), dark: Color(hex: 0xC27B37, alpha: 0.2))

    static let bp = Color(light: Color(hex: 0xC2477A), dark: Color(hex: 0xC2477A))
    static let bpOn = Color(light: Color(hex: 0xC2477A, alpha: 0.4), dark: Color(hex: 0xC2477A, alpha: 0.45))

    static let statusGood = Color(light: Color(hex: 0x2FA36B), dark: Color(hex: 0x3BBE84))
    static let statusGoodSoft = Color(light: Color(hex: 0x2FA36B, alpha: 0.14), dark: Color(hex: 0x3BBE84, alpha: 0.18))
    static let statusWarn = Color(light: Color(hex: 0xD08A1F), dark: Color(hex: 0xDDA030))
    static let statusWarnSoft = Color(light: Color(hex: 0xD08A1F, alpha: 0.14), dark: Color(hex: 0xDDA030, alpha: 0.18))
    static let statusCritical = Color(light: Color(hex: 0xD14545), dark: Color(hex: 0xE15C5C))
    static let statusCriticalSoft = Color(light: Color(hex: 0xD14545, alpha: 0.14), dark: Color(hex: 0xE15C5C, alpha: 0.18))
}

// A card matching the web app's rounded, softly-shadowed surface.
struct VDCard<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(VDColor.surface, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(VDColor.border, lineWidth: 1)
        )
    }
}

struct VDEyebrow: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(VDColor.inkFaint)
            .tracking(0.4)
    }
}

struct VDPill: View {
    let text: String
    let systemImage: String
    let tint: Color
    let tintSoft: Color

    var body: some View {
        Label(text, systemImage: systemImage)
            .font(.system(size: 13, weight: .bold))
            .foregroundStyle(tint)
            .padding(.vertical, 5)
            .padding(.horizontal, 10)
            .background(tintSoft, in: Capsule())
    }
}
