import type { StandPhoto } from "@/components/gallery/StandPhotoTile";
import type { RelatedArticle } from "@/lib/blog/related-articles";
import type { ArticleHeading } from "@/lib/blog/heading-ids";
import type { Testimonial } from "@/lib/testimonials";
import ArticleToc from "./ArticleToc";
import SidebarFeatureLinks from "./SidebarFeatureLinks";
import SidebarRelatedLinks from "./SidebarRelatedLinks";
import SidebarSignupCard from "./SidebarSignupCard";
import SidebarStandsProof from "./SidebarStandsProof";

export default function ArticleSidebar({
  slug,
  headings,
  related,
  photos,
  testimonial,
}: {
  slug: string;
  headings: ArticleHeading[];
  related: RelatedArticle[];
  photos: StandPhoto[];
  testimonial?: Testimonial;
}) {
  return (
    <aside className="mt-14 flex flex-col gap-5 lg:mt-0" aria-label="More from Vendl">
      <ArticleToc headings={headings} />
      <SidebarRelatedLinks items={related} />
      <SidebarFeatureLinks />
      <SidebarStandsProof photos={photos} testimonial={testimonial} />
      <div className="lg:sticky lg:top-6">
        <SidebarSignupCard slug={slug} />
      </div>
    </aside>
  );
}
