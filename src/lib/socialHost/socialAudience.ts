/**
 * Who the social AI writes for. Used as the system prompt / audience line in
 * caption, image and planner prompts. Kept free of server imports because
 * caption context modules are bundled into client components.
 */
export const VENDL_SOCIAL_AUDIENCE =
  'small Australian businesses that sell direct to local customers - farm stalls, home bakers, ' +
  'market stallholders, home food businesses and local producers. Customers order online, ' +
  'pre-order for a collection day, subscribe to a regular box, or buy at the stall.'
