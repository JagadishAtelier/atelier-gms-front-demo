export default function MemberRenewal() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Coming Soon</title>
</head>
<body style="
  margin:0;
  padding:0;
  height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#0d0d0d;
  font-family:Arial,Helvetica,sans-serif;
  color:#ffffff;
">

  <div style="
    text-align:center;
    max-width:520px;
    padding:40px;
    border-radius:12px;
    border:1px solid #1f1f1f;
    background:#000000;
    box-shadow:0 0 40px rgba(225,6,0,0.15);
    animation:fadeIn 1.2s ease-out;
  ">

    <!-- Logo / Title -->
    <h1 style="
      margin:0;
      font-size:36px;
      letter-spacing:2px;
    ">
      FLEX <span style="color:#e10600">CULTURE</span>
    </h1>

    <!-- Pulse line -->
    <div style="
      width:80px;
      height:3px;
      background:#e10600;
      margin:18px auto;
      animation:pulse 1.5s infinite;
    "></div>

    <!-- Text -->
    <h2 style="
      font-size:22px;
      margin:20px 0 10px;
      font-weight:normal;
    ">
      Coming Soon
    </h2>

    <p style="
      font-size:14px;
      color:#cccccc;
      line-height:1.6;
      margin:0 0 30px;
    ">
      We’re building something powerful for you.  
      This feature will be available very soon.
    </p>

    <!-- Animated dots -->
    <div style="font-size:28px; letter-spacing:6px;">
      <span style="animation:dot 1.5s infinite">.</span>
      <span style="animation:dot 1.5s infinite 0.3s">.</span>
      <span style="animation:dot 1.5s infinite 0.6s">.</span>
    </div>

    <!-- Footer note -->
    <div style="
      margin-top:30px;
      font-size:12px;
      color:#888888;
    ">
      Stay consistent. Stay strong 💪
    </div>

  </div>

  <!-- Inline Animations -->
  <style>
    @keyframes fadeIn {
      from { opacity:0; transform:translateY(20px); }
      to { opacity:1; transform:translateY(0); }
    }

    @keyframes pulse {
      0% { opacity:0.3; }
      50% { opacity:1; }
      100% { opacity:0.3; }
    }

    @keyframes dot {
      0% { opacity:0.2; }
      50% { opacity:1; }
      100% { opacity:0.2; }
    }
  </style>

</body>
</html>
`
      }}
    />
  );
}
