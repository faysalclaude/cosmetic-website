import { createClient } from "@/lib/supabase/browser";
import { createUploadUrlAction } from "@/lib/actions/product-media";
import { BUCKET } from "@/lib/storage";
import { toOptimizedImage } from "@/lib/image-utils";

// Browser -> Supabase Storage directly, using a one-time signed URL made by an admin-only action.
export async function uploadProductMedia(
  productId: string,
  kind: "image" | "showcase",
  source: Blob,
  opts: { maxSide: number; quality: number },
): Promise<{ path: string; blob: Blob }> {
  const { blob, ext } = await toOptimizedImage(source, opts.maxSide, opts.quality);

  const prepared = await createUploadUrlAction(productId, kind, ext);
  if (!prepared.ok) throw new Error(prepared.error);

  const { error } = await createClient()
    .storage.from(BUCKET)
    .uploadToSignedUrl(prepared.path, prepared.token, blob, { contentType: blob.type });
  if (error) throw new Error(error.message);

  return { path: prepared.path, blob };
}