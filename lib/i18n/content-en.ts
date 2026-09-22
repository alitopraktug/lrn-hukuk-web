/**
 * İngilizce içerik çevirileri — sabit (panelden düzenlenmez). Çalışma alanları slug ile,
 * ekip üyeleri slug ile eşleşir; eşleşme yoksa (yeni eklenen bir alan/kişi) EN sayfa Türkçe
 * içeriği bir uyarıyla birlikte gösterir (bkz. app/en/practice-areas/[slug], app/en/team/[slug]).
 * Bu, avukatlık meslek kurallarına uygunluk açısından TR metinlerle aynı ilkeleri izler:
 * iddia/reklam dili yoktur, sonuç vaadi yoktur.
 */

const closingEn = (topic: string) =>
  `<h2>How we work</h2><p>Every ${topic.toLowerCase()} matter is assessed on its own facts, documents and deadlines. The legal situation and the process are explained to the client in plain language. How a matter concludes depends on its specific circumstances, the evidence and the applicable legislation; for this reason, no prediction or promise is made as to the outcome.</p>`;

export type AreaTranslation = { title: string; shortDescription: string; topics: string[]; content: string };

export const AREA_TRANSLATIONS_EN: Record<string, AreaTranslation> = {
  "is-ve-sosyal-guvenlik-hukuku": {
    title: "Labour & Social Security Law",
    shortDescription: "Legal matters arising from the employment relationship, and social insurance and social security proceedings.",
    topics: [
      "Formation and termination of employment contracts",
      "Reinstatement claims",
      "Severance and notice pay",
      "Overtime, wages and other employee receivables",
      "Workplace accidents and occupational disease",
      "Service determination and insured status",
      "Social security (SGK) proceedings and retirement",
      "Workplace practices and employer obligations",
    ],
    content:
      "<h2>Scope</h2><p>Labour law governs the relationship between employee and employer and the rights and obligations arising from it. Social security law covers insured status, contribution obligations and social insurance benefits. The two areas often overlap: a workplace accident, for example, must be assessed both from the perspective of employee receivables and social security benefits.</p><h2>Deadlines and documentation</h2><p>The exercise of many rights under labour law is subject to statutory deadlines; applications such as reinstatement claims can carry short limitation periods. For this reason, once a dispute arises, it is important to review the employment contract, payslips, workplace records and correspondence — and the applicable deadlines — at an early stage.</p>" +
      closingEn("labour and social security law"),
  },
  "ceza-hukuku": {
    title: "Criminal Law",
    shortDescription: "Defence and victim/complainant representation during investigation and prosecution, and criminal proceedings generally.",
    topics: [
      "Legal assistance during the investigation stage",
      "Defence of suspects and defendants",
      "Representation of victims and complainants",
      "Detention and judicial control measures",
      "Mediation and effective remorse",
      "Appeals (regional court and Court of Cassation)",
      "Execution of sentences",
      "Collection and assessment of evidence",
    ],
    content:
      "<h2>Scope</h2><p>Criminal law comprises substantive criminal law, which defines which acts constitute an offence and the sanctions attached to them, and criminal procedure law, which governs how proceedings are conducted. Proceedings typically begin with an investigation triggered by a complaint or report, continue into prosecution once an indictment is accepted, and may proceed to appeal where necessary.</p><h2>Defence and participation rights</h2><p>Suspects, defendants, victims and injured parties have procedural rights under the law. Exercising these rights correctly and in a timely manner matters for the lawfulness of the process. Access to the investigation file, giving statements and the assessment of evidence are each considered separately in every file.</p>" +
      closingEn("criminal law"),
  },
  "saglik-hukuku": {
    title: "Health Law",
    shortDescription: "Legal liability arising from the provision of healthcare, patient rights, and matters concerning healthcare professionals.",
    topics: [
      "Patient rights and informed consent",
      "Legal liability arising from medical intervention",
      "Legal status of healthcare professionals",
      "Proceedings concerning healthcare institutions",
      "Disciplinary and administrative investigations",
      "Compensation claims",
      "Access to medical documents and records",
      "Health legislation",
    ],
    content:
      "<h2>Scope</h2><p>Health law covers the rules governing the relationship between patient, healthcare professional and healthcare institution in the course of providing care. The field intersects with private law, criminal law and administrative law, so the same event can give rise to consequences that must be assessed from a compensation, disciplinary and criminal-law perspective all at once.</p><h2>The importance of documentation</h2><p>In disputes of this kind, the patient file, consent forms, medical records and expert examinations play a decisive role. Obtaining these documents properly, and expressing technically demanding issues correctly in legal terms, matters for how the process unfolds.</p>" +
      closingEn("health law"),
  },
  "sirketler-hukuku": {
    title: "Corporate Law",
    shortDescription: "Company formation, governance, shareholder relations and changes to corporate structure.",
    topics: [
      "Company formation and choice of company type",
      "Articles of association and shareholders' agreements",
      "General assembly and board resolutions",
      "Share transfers and capital changes",
      "Disputes between shareholders",
      "Director and officer liability",
      "Mergers, demergers and conversions",
      "Dissolution and liquidation",
    ],
    content:
      "<h2>Scope</h2><p>Corporate law governs the formation of joint-stock, limited-liability and other commercial companies, their corporate bodies, the relationships between shareholders, and the process through to a company's dissolution. Decisions affecting corporate structure usually require the law and the articles of association to be read together.</p><h2>Internal corporate procedures</h2><p>The validity of steps such as holding general assembly meetings, board resolutions, share transfers and capital changes depends on complying with formal requirements and quorum rules. Planning and properly recording such steps matters for preventing disputes later on.</p>" +
      closingEn("corporate law"),
  },
  "ticaret-hukuku": {
    title: "Commercial Law",
    shortDescription: "Commercial relationships, commercial contracts, negotiable instruments and commercial disputes.",
    topics: [
      "Drafting and review of commercial contracts",
      "Commercial receivables and collection proceedings",
      "Cheques, promissory notes and other negotiable instruments",
      "Dealership and distribution relationships",
      "Unfair competition",
      "Commercial books and merchant obligations",
      "Transfer of a commercial enterprise",
      "Mediation and litigation in commercial disputes",
    ],
    content:
      "<h2>Scope</h2><p>Commercial law covers the rules governing merchants' activities, the commercial enterprise, commercial contracts and negotiable instruments. In commercial relationships, written documents, contract terms and the parties' actual conduct are decisive in resolving disputes.</p><h2>Contracts and deadlines</h2><p>Clearly defining the parties' rights and obligations in commercial contracts narrows the scope of disputes that may arise later. For negotiable instruments and commercial receivables, matters such as limitation periods and presentment periods are assessed separately. In some commercial disputes, mediation must be attempted before a lawsuit can be filed.</p>" +
      closingEn("commercial law"),
  },
  "aile-hukuku": {
    title: "Family Law",
    shortDescription: "Termination of marriage, arrangements concerning children, matrimonial property and protection within the family.",
    topics: [
      "Uncontested and contested divorce",
      "Custody and personal contact arrangements",
      "Alimony and child support",
      "Liquidation of matrimonial property",
      "Parentage and acknowledgement",
      "Adoption",
      "Protective measures against domestic violence",
      "Disputes over the family home and household property",
    ],
    content:
      "<h2>Scope</h2><p>Family law governs personal and family matters such as marriage, divorce, the relationship between children and parents, alimony/child support, matrimonial property and parentage. Alongside their legal dimension, matters in this field carry significant personal consequences for those involved, so the process should be handled carefully and with restraint.</p><h2>The child's best interests and financial consequences</h2><p>In matters concerning children (custody, personal contact, child support), the child's best interests are the guiding principle. The financial consequences of divorce — matrimonial property, alimony, compensation — are assessed separately based on the spouses' assets and transactions made during the marriage. Special procedures apply to applications for protective measures in cases of domestic violence.</p>" +
      closingEn("family law"),
  },
  "idare-hukuku": {
    title: "Administrative Law",
    shortDescription: "Remedies against acts and actions of the administration, administrative litigation, and public-law proceedings.",
    topics: [
      "Actions for annulment",
      "Actions for full remedy (compensation)",
      "Stay of execution",
      "Public employment law",
      "Zoning, planning and expropriation",
      "Public procurement",
      "Administrative fines and sanctions",
      "Time limits for administrative appeals and litigation",
    ],
    content:
      "<h2>Scope</h2><p>Administrative law governs the acts and actions of public institutions and bodies, their lawfulness, and the relationship between individuals and the administration. Legal remedies against an administrative act are generally pursued through actions for annulment or full remedy before the administrative courts.</p><h2>Time limits</h2><p>Time limits for challenging administrative acts can be short, and the limitation period usually begins on notification or publication of the act. Some acts require an administrative appeal before a lawsuit can be filed. For this reason, when an administrative act is encountered, the relevant document and its notification date should be reviewed at an early stage.</p>" +
      closingEn("administrative law"),
  },
};

export type TeamTranslation = { title: string; shortBio: string; bio: string };

export const TEAM_TRANSLATIONS_EN: Record<string, TeamTranslation> = {
  "demo-profil-bir": {
    title: "Founding Lawyer",
    shortBio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
    bio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
  },
  "demo-profil-iki": {
    title: "Senior Lawyer",
    shortBio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
    bio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
  },
  "demo-profil-uc": {
    title: "Lawyer",
    shortBio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
    bio: "Demo content — this profile was created to show the profile layout. Real details will be entered from the admin panel.",
  },
};
