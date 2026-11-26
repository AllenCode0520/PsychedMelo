/**
 * 整個畫面的 CRT 老電視質感：跳動的雜訊、掃描線、暗角、輕微閃爍。
 * 純裝飾，不會擋住點擊；系統設定「減少動態」時會停止動畫。
 */
export function CrtOverlay() {
  return (
    <div className="crt" aria-hidden="true">
      <div className="crt__noise" />
      <div className="crt__scan" />
      <div className="crt__vignette" />
    </div>
  );
}
