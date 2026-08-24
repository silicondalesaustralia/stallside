import type {
  ClassificationBlock,
  CountryCode,
  ExplicitGap,
  GateType,
  Maybe,
  MaybeConditional,
  RegulatorDeterminedBy,
  SourceEntry,
} from "./primitives";

export type JurisdictionRecord = {
  code: string;
  country: CountryCode;
  name: string;
  slug: string;
  demonym: string;
  meta: {
    last_verified: string;
    verified_by: string;
    regulator_page_last_updated: string | ExplicitGap | null;
    next_review_due: string;
    completeness: "phase0_partial" | "research_complete" | "verified_publishable";
  };
  law: {
    statute: string;
    statute_url: string;
    key_section: string;
    regulations: string[];
    code_applies: Maybe<boolean>;
  };
  gate: {
    type: GateType;
    regulator_primary: string;
    regulator_fallback: string;
    regulator_determined_by: RegulatorDeterminedBy;
    mechanism: string;
    form_url: string;
    portal_url: string;
    fee: Maybe<number>;
    fee_currency: "AUD" | "USD" | ExplicitGap | null;
    fee_notes: string;
    timing: string;
    per_site: Maybe<boolean>;
    transferable: Maybe<boolean>;
    change_of_details_rule: string;
    statement_of_trade_required: MaybeConditional;
    penalty_max_individual: Maybe<number>;
    penalty_max_body_corporate: Maybe<number>;
    penalty_expiation_individual: Maybe<number>;
    penalty_expiation_body_corporate: Maybe<number>;
    penalty_max_individual_units: Maybe<number>;
    penalty_max_body_corporate_units: Maybe<number>;
  };
  classification: ClassificationBlock | null;
  scope: {
    sales_cap: Maybe<number>;
    sales_cap_basis: "gross" | "net" | ExplicitGap | null;
    approved_food_list: Maybe<boolean>;
    prohibited_foods: string[] | ExplicitGap;
    definition_of_sale_includes_donations: Maybe<boolean>;
    applies_to_one_off_sales: Maybe<boolean>;
    applies_to_charitable: MaybeConditional;
    primary_production_carve_out: Maybe<boolean>;
    farm_gate_requires_notification: MaybeConditional;
    manufacture_triggers_licence: MaybeConditional;
    licence_exemptions: string[];
    commodity_schemes: string[];
    commodity_scheme_regulator: string;
  };
  channels: {
    direct_to_consumer: Maybe<boolean>;
    farmers_markets: Maybe<boolean>;
    farm_gate: Maybe<boolean>;
    roadside_stall: Maybe<boolean>;
    unattended_honesty_stall: Maybe<boolean>;
    online_orders_local_pickup: Maybe<boolean>;
    shipping: Maybe<boolean>;
    wholesale_to_retail: Maybe<boolean>;
    render_as?: "table" | "prose";
    render_reason?: string;
    notes: string;
  };
  labelling: {
    basis?: string;
    required_elements: string[];
    mandated_disclaimer_text: string | ExplicitGap;
    allergen_rule: string;
    nutrition_panel_required: Maybe<boolean>;
    country_of_origin_required: Maybe<boolean>;
    supplier_address_required: Maybe<boolean>;
    address_can_be_non_residential: Maybe<boolean>;
  };
  training: {
    food_handler_skills_required: Maybe<boolean>;
    food_safety_supervisor_required: MaybeConditional;
    fss_trigger: string;
    free_training_accepted: Maybe<boolean>;
    free_training_name: string;
    free_training_url: string;
  };
  premises: {
    home_kitchen_allowed: Maybe<boolean>;
    inspection_required: MaybeConditional;
    inspection_frequency_basis: string;
    inspection_fee: Maybe<number>;
    construction_standard: string;
    exemptions_available: Maybe<boolean>;
    exemptions_never_granted_for: string[];
  };
  food_safety_management: {
    standard_322a_applies: MaybeConditional;
    standard_322a_trigger: string;
    food_safety_program_required: MaybeConditional;
    food_safety_program_trigger: string;
    records_required: MaybeConditional;
  };
  money: {
    sales_tax_applies: Maybe<boolean>;
    gst_threshold: Maybe<number>;
    abn_required: Maybe<boolean>;
    hobby_vs_business_test_url: string;
    insurance_typical_market_requirement: ExplicitGap | string;
  };
  contact: {
    phone: string;
    email: string;
    url: string;
    council_directory_url: string;
    council_count: number | null;
  };
  unique: {
    quirk_paragraph: string;
    common_mistake: string;
    what_does_not_apply: string;
  };
  information_gain: string[];
  sources: SourceEntry[];
};
