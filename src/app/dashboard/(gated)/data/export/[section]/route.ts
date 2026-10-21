import type { NextRequest } from "next/server";
import { loadSelectedDataContext } from "@/lib/data-transfer/selected-context";
import { DATA_SECTIONS, isSectionId, SECTION_IDS } from "@/lib/data-transfer/registry";
import { createZip } from "@/lib/data-transfer/zip";

export const maxDuration = 120;

function download(body: string | Buffer, fileName: string, type: string) {
  return new Response(typeof body === "string" ? body : new Uint8Array(body), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest, ctx: RouteContext<"/dashboard/data/export/[section]">) {
  const { section } = await ctx.params;
  const dataCtx = await loadSelectedDataContext();
  if (!dataCtx) return new Response("No business selected.", { status: 400 });
  const day = new Date().toISOString().slice(0, 10);
  try {
    if (section === "all") {
      const entries = [];
      for (const id of SECTION_IDS) {
        const csv = await DATA_SECTIONS[id].exportCsv(dataCtx);
        entries.push({ name: DATA_SECTIONS[id].fileName, data: Buffer.from(csv, "utf8") });
      }
      return download(createZip(entries), `${dataCtx.stand.slug}-export-${day}.zip`, "application/zip");
    }
    if (!isSectionId(section)) return new Response("Unknown section.", { status: 404 });
    const def = DATA_SECTIONS[section];
    const csvType = "text/csv; charset=utf-8";
    if (request.nextUrl.searchParams.get("template") === "1") {
      if (!def.templateCsv) return new Response("No template for this section.", { status: 404 });
      return download(def.templateCsv(), `template-${def.fileName}`, csvType);
    }
    const csv = await def.exportCsv(dataCtx);
    return download(csv, `${dataCtx.stand.slug}-${def.fileName.replace(".csv", "")}-${day}.csv`, csvType);
  } catch (error) {
    console.error("Data export failed", section, error);
    return new Response("Could not build the export. Please try again.", { status: 500 });
  }
}
