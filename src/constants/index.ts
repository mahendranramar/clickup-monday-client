export const ROOT_DOMAIN = ".konnectifyapp.co"; //".staging.us.konnectify.dev"; // .prestaging.us.konnectify.dev | .stack5.us.konnectify.dev
export const API_PATH = "/ipaas/api";
export const UI_PATH = "/ipaas/ui";

export const APP_IDS = {
  monday: "mondaycrm-1.0.0",
  apollo: "apollo-1.0.0",
} as const;

// ─── Secondary app config ────────────────────────────────────────────────────
// Monday.com is the fixed primary app. SECONDARY_APP describes whichever app
// it's currently paired with (Apollo today). This is the ONLY 
// place you
// need to edit to swap it out for Hubspot/etc.
//
// NOTE: swapping this alone does NOT swap the workflow template — see
// WORKFLOW_TEMPLATES below, its `id` points at a template folder whose
// actual contents ("Monday contact -> Apollo sequence") are app-specific.
// You'll need a new template id whenever the secondary app changes.
export const SECONDARY_APP = {
  // internal identifier — used as the Step id / discriminated union key in
  // SetupWizard.tsx.
  key: "apollo",

  // the id connectionService/konnectifyClient use to identify this app
  appId: APP_IDS.apollo,

  // human-facing name, properly capitalized
  displayName: "Apollo",

  // name sent to connectionService.create/edit
  connectionName: "Apollo Connection",

  // wizard step indicator label
  stepLabel: "Connect Apollo",

  // button copy
  connectButtonText: "Connect Apollo",
  connectedButtonText: "Apollo Connected",

  // SecondaryAppStep form copy
  panelSubtitle: "Click Connect Apollo to authorize your account with OAuth 2.0",

  // TemplatesStep bullet copy
  templateDescription: "Monday contacts -> Apollo sequences",
} as const;

export const templateFolderId = 8 as const;
export const orgId = "27" as const;
export const projectId = "27" as const;

// export const WORKFLOW_TEMPLATE_IDS = [3] as const;
// export const WORKFLOW_TEMPLATE_IDS = [4] as const;

export const WORKFLOW_TEMPLATES = [
  {
    id: templateFolderId,
    name: "Add Newly Created Monday Contact to Apollo Sequence",
    description: "Automatically adds a newly created contact from monday CRM to a selected Apollo sequence.",
  },
] as const;

export const ACCOUNT_SETTINGS_SECTIONS = [{ id: "connections", label: "Connections" }] as const;

export const BOARD_VIEW_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "workflows", label: "Workflows" },
  { id: "logs", label: "Event Logs" },
] as const;

export type AccountSettingsSection = (typeof ACCOUNT_SETTINGS_SECTIONS)[number]["id"];
export type BoardViewSection = (typeof BOARD_VIEW_SECTIONS)[number]["id"];
