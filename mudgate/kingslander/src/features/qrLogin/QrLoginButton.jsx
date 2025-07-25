import { QRCodeCanvas } from "qrcode.react";  // or QRCodeSVG
import { useQrLoginStore } from "./useQrLoginStore";

export default function QrLoginButton() {
  const { sid, status, init, reset } = useQrLoginStore();

  const begin = async () => {
    if (status === "idle") await init();
  };

  // when bridge flips to authenticated, redirect to Keycloak OIDC
  if (status === "authenticated") {
    window.location.href =
      "https://cloaking.bernard-labs.com/realms/master/protocol/openid-connect/auth" +
      "?client_id=kings-lander" +
      "&redirect_uri=" + encodeURIComponent(window.location.href) +
      "&response_type=code";
    return null;
  }

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      {status === "idle" && (
        <button onClick={begin}>Log in with phone</button>
      )}

      {status === "pending" && (
        <>
          <p>Scan with your phone</p>
          <QRCodeCanvas
            value={`https://cloaking.bernard-labs.com/qr-login/confirm/${sid}`}
            size={256}
          />
          <p><button onClick={reset}>Cancel</button></p>
        </>
      )}
    </div>
  );
}
