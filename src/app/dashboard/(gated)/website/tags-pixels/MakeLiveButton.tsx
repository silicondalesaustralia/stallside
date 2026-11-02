import { publishTrackingLive } from "./actions";
import { tagsPrimaryButton } from "./tags-styles";

export default function MakeLiveButton({ disabled, slug }: { disabled: boolean; slug?: string }) {
  return (
    <form action={publishTrackingLive}>
      {slug ? <input type="hidden" name="slug" value={slug} /> : null}
      <button type="submit" disabled={disabled} className={tagsPrimaryButton}>
        Make tags live
      </button>
    </form>
  );
}
