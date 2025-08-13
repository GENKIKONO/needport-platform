export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";

// Only allow in development
if (process.env.NODE_ENV === "production") {
  throw new Error("Not available in production");
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const kind = sp.kind as string | undefined;
  const needId = sp.needId as string | undefined;
  const refId = sp.refId as string | undefined;

  let emailContent: { subject: string; html: string; text: string } | null = null;
  let error: string | null = null;

  if (kind && needId) {
    try {
      const admin = createAdminClient();
      
      // Get need data
      const { data: need } = await admin
        .from("needs")
        .select("title, notify_email")
        .eq("id", needId)
        .single();

      if (!need) {
        error = "Need not found";
      } else {
        // Generate email content based on kind
        switch (kind) {
          case 'offer.added':
            if (refId) {
              const { data: offer } = await admin
                .from("offers")
                .select("vendor_name, amount")
                .eq("id", refId)
                .single();
              if (offer) {
                const { offerAddedMail } = await import("@/emails/offer_added");
                emailContent = offerAddedMail(need, offer);
              } else {
                error = "Offer not found";
              }
            } else {
              error = "refId required for offer.added";
            }
            break;
          default:
            error = `Unknown kind: ${kind}`;
        }
      }
    } catch (e: any) {
      error = e?.message ?? "Unknown error";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Preview</h1>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form method="GET" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kind</label>
              <select 
                name="kind" 
                defaultValue={kind}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select kind...</option>
                <option value="offer.added">offer.added</option>
                <option value="offer.updated">offer.updated</option>
                <option value="offer.deleted">offer.deleted</option>
                <option value="offer.adopted">offer.adopted</option>
                <option value="offer.unadopted">offer.unadopted</option>
                <option value="need.threshold_reached">need.threshold_reached</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Need ID</label>
              <input
                type="text"
                name="needId"
                defaultValue={needId}
                placeholder="Enter need ID..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Ref ID (optional)</label>
              <input
                type="text"
                name="refId"
                defaultValue={refId}
                placeholder="Enter ref ID..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Preview Email
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Email Preview */}
        {emailContent && (
          <div className="space-y-8">
            {/* Subject */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Subject</h2>
              <p className="text-gray-800">{emailContent.subject}</p>
            </div>

            {/* HTML Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">HTML Preview</h2>
              <div 
                className="border border-gray-200 rounded-lg p-4"
                dangerouslySetInnerHTML={{ __html: emailContent.html }}
              />
            </div>

            {/* Plain Text */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Plain Text</h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-lg">
                {emailContent.text}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
