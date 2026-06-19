import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/lib/api/env";

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const targetPath = pathSegments.join("/");
  const url = new URL(`${getApiUrl()}/${targetPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const authorization = request.headers.get("Authorization");
  if (authorization) headers.Authorization = authorization;

  const empresaId = request.headers.get("X-Empresa-Id");
  if (empresaId) headers["X-Empresa-Id"] = empresaId;

  const deviceToken = request.headers.get("X-Device-Token");
  if (deviceToken) headers["X-Device-Token"] = deviceToken;

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("Content-Type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      body = await request.arrayBuffer();
      headers["Content-Type"] = contentType;
    } else {
      const text = await request.text();
      if (text) {
        body = text;
        headers["Content-Type"] = contentType || "application/json";
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const contentType = response.headers.get("Content-Type") ?? "application/json";
  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": contentType },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
