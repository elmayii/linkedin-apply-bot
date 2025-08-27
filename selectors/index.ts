export default {
  easyApplyButtonEnabled: "#jobs-apply-button-id",

  // Job search form
  keywordInput: 'input[id*="jobs-search-box-keyword-id"]',
  locationInput: 'input[id*="jobs-search-box-location-id"]',

  // Easy apply form
  checkbox: ".jobs-easy-apply-modal input[type='checkbox']",
  fieldset: ".jobs-easy-apply-modal fieldset",
  select: ".fb-dash-form-element__select-dropdown",
  divModal: ".eBDuhiCLMjpfcyMCoIcBFUhDkadCaOORvtQ",
  nextButton: "button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view",
  submit: ".jobs-easy-apply-modal footer button[aria-label*='Submit']",
  enabledSubmitOrNextButton: ".jobs-easy-apply-modal footer button[aria-label*='Submit']:enabled, .jobs-easy-apply-modal  footer button[aria-label*='next']:enabled, .jobs-easy-apply-modal  footer button[aria-label*='Review']:enabled",
  textInput: ".jobs-easy-apply-modal input[type='text'], .jobs-easy-apply-modal textarea",
  homeCity: ".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='city-HOME-CITY']",
  phone: ".jobs-easy-apply-modal input[id*='easyApplyFormElement'][id*='phoneNumber']",
  documentUpload: ".jobs-easy-apply-modal div[class*='jobs-document-upload']",
  documentUploadLabel: "label[class*='jobs-document-upload']",
  documentUploadInput: "input[type='file'][id*='jobs-document-upload']",
  radioInput: "input[type='radio']",
  option: "option",
  followCompanyCheckbox: 'input[type="checkbox"]#follow-company-checkbox',
  postApplyModal: "#post-apply-modal",

  // Login
  captcha: "#captcha-internal",
  emailInput: "#username",
  passwordInput: "#password",
  loginSubmit: "button.btn__primary--large.from__button--floating",
  skipButton: "button[text()='Skip']",

  // fetch user
  searchResultList: ".scaffold-layout__list ul",
  searchResultListText: "small.jobs-search-results-list__text",
  searchResultListItem: 'span[dir="ltr"]',
  searchResultListItemLink: "a.job-card-list__title",
  searchResultListItemCompanyName: ".job-details-jobs-unified-top-card__company-name a",
  jobDescription: "div.jobs-description-content > div.jobs-description-content__text > span",
  appliedToJobFeedback: "#jobs-apply-see-application-link",

  // fetch guest
  jobCount: ".results-context-header__job-count",
  showMoreButton: ".infinite-scroller__show-more-button:enabled",
  searchResultListItemGuest: ".jobs-search__results-list li",
  searchResultListItemTitleGuest: ".base-search-card__title",
  searchResultListItemSubtitleGuest: ".base-search-card__subtitle",
  searchResultListItemLocationGuest: ".job-search-card__location",
}
