export default async (_request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 304 || !response.body || !contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const nonce = crypto.randomUUID();
  const html = await response.text();
  const body = html.replace(/<script\b([^>]*)>/gi, (_tag, attributes) => {
    const withoutOldNonce = attributes.replace(/\snonce=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "");
    return `<script nonce="${nonce}"${withoutOldNonce}>`;
  });

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("content-md5");
  headers.delete("etag");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.googleadservices.com",
      "frame-src https:",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
