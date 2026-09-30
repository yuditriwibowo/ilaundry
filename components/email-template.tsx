import * as React from "react";

// Template email kode verifikasi MFA yLaundry — dikirim via parameter
// `react:` Resend (Node.js only). Dipanggil sebagai FUNCTION CALL:
// EmailTemplate({ firstName, kode }), bukan JSX (<EmailTemplate ... />).
// Inline style wajib untuk email client (sebagian besar mengabaikan
// stylesheet eksternal).

interface EmailTemplateProps {
  firstName: string;
  kode: string;
}

export function EmailTemplate({ firstName, kode }: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        backgroundColor: "#f3f4f6",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "20px", color: "#111827", margin: "0 0 8px" }}>
          Halo, {firstName}!
        </h1>
        <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 24px" }}>
          Berikut adalah kode verifikasi unik Anda:
        </p>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            letterSpacing: "10px",
            color: "#1d4ed8",
            backgroundColor: "#eff6ff",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          {kode}
        </div>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px" }}>
          Kode ini berlaku selama <strong>3 menit</strong>. Jangan bagikan
          kode ini kepada siapa pun.
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Jika Anda tidak merasa meminta kode ini, abaikan email ini.
        </p>
      </div>
    </div>
  );
}