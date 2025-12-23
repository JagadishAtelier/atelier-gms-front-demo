import { usePWAInstall } from "../hooks/usePWAInstall";
import "./PWAInstallBanner.css";

export default function PWAInstallBanner() {
  const { isInstallable, installApp, dismissBanner, isIOS } =
    usePWAInstall();

  if (!isInstallable && !isIOS) return null;

  return (
    <div className="pwa-banner">
      <div className="pwa-text">
        {isIOS ? (
          <>
            Install this app: <br />
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </>
        ) : (
          "Install Gym Management App"
        )}
      </div>

      <div className="pwa-actions">
        {!isIOS && (
          <button className="pwa-button" onClick={installApp}>
            Install
          </button>
        )}

        <button className="pwa-dismiss" onClick={dismissBanner}>
          ✕
        </button>
      </div>
    </div>
  );
}
