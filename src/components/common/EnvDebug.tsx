// Debug component to show environment variables
export default function EnvDebug() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'black',
        color: 'lime',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '400px',
        borderRadius: '4px',
        border: '2px solid lime',
      }}
    >
      <div>
        <strong>🔧 ENV DEBUG:</strong>
      </div>
      <div>VITE_API_URL: {import.meta.env.VITE_API_URL || 'NOT SET'}</div>
      <div>VITE_API_KEY: {import.meta.env.VITE_API_KEY ? '***SET***' : 'NOT SET'}</div>
      <div>MODE: {import.meta.env.MODE}</div>
      <div>DEV: {import.meta.env.DEV ? 'true' : 'false'}</div>
      <div>PROD: {import.meta.env.PROD ? 'true' : 'false'}</div>
    </div>
  )
}
