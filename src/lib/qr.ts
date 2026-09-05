import QRCode from "qrcode";

// Encodes ONLY the opaque token — never name, plan, phone, or expiry.
// The scanner sends this token to scan_membership_qr, which resolves
// everything else server-side.
export async function generateMembershipQrDataUrl(token: string) {
  return QRCode.toDataURL(token, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
