"use client";

import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { SlugField, SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Alert, Card, Checkbox, Field, Select, StatusBadge, TextArea, TextInput, btnClass } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";

export type TeamFormValues = {
  fullName: string;
  title: string;
  slug: string;
  shortBio: string;
  bio: string;
  education: string;
  barAssociation: string;
  tbbNo: string;
  barNo: string;
  careerStart: string;
  languages: string;
  writings: string;
  email: string;
  linkedin: string;
  photoPosition: string;
  visible: string[];
  areaIds: string[];
  seoTitle: string;
  seoDescription: string;
  photo: PickedMedia | null;
  status: "DRAFT" | "PUBLISHED";
};

const VISIBILITY: { key: string; label: string }[] = [
  { key: "education", label: "Eğitim" },
  { key: "barInfo", label: "Baro ve sicil bilgileri" },
  { key: "careerStart", label: "Mesleğe başlama tarihi" },
  { key: "practiceAreas", label: "Çalışma alanları" },
  { key: "languages", label: "Yabancı diller" },
  { key: "writings", label: "Yayınlar" },
  { key: "email", label: "E-posta" },
  { key: "linkedin", label: "LinkedIn" },
];

const POSITIONS = [
  { value: "50% 0%", label: "Üst" },
  { value: "50% 25%", label: "Üste yakın (varsayılan)" },
  { value: "50% 50%", label: "Orta" },
  { value: "50% 75%", label: "Alta yakın" },
  { value: "50% 100%", label: "Alt" },
];

export function TeamForm({
  id,
  values,
  areas,
  action,
  saved,
}: {
  id: string | null;
  values: TeamFormValues;
  areas: { id: string; title: string }[];
  action: (id: string | null, prev: ActionState, formData: FormData) => Promise<ActionState>;
  saved?: boolean;
}) {
  const { state, pending, intent, onSubmit } = useServerForm(action.bind(null, id));
  const e = state.fieldErrors ?? {};
  const active = values.status === "PUBLISHED";

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="sticky top-14 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <StatusBadge status={values.status} active />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {active ? (
            <>
              <SubmitButton name="intent" value="publish" pending={pending} activeIntent={intent}>
                Kaydet
              </SubmitButton>
              <SubmitButton name="intent" value="unpublish" variant="secondary" pending={pending} activeIntent={intent} pendingLabel="İşleniyor…">
                Pasife al
              </SubmitButton>
            </>
          ) : (
            <>
              <SubmitButton name="intent" value="draft" variant="secondary" pending={pending} activeIntent={intent}>
                Pasif olarak kaydet
              </SubmitButton>
              <SubmitButton name="intent" value="publish" pending={pending} activeIntent={intent} pendingLabel="Etkinleştiriliyor…">
                Kaydet ve sitede göster
              </SubmitButton>
            </>
          )}
          {id ? (
            <Link href={`/admin/ekip/${id}/onizleme`} target="_blank" className={btnClass.secondary}>
              <Eye size={16} aria-hidden="true" />
              Önizle
            </Link>
          ) : null}
          {id && active ? (
            <Link href={`/ekibimiz/${values.slug}`} target="_blank" className={btnClass.ghost}>
              <ExternalLink size={16} aria-hidden="true" />
              Profili aç
            </Link>
          ) : null}
        </div>
      </div>

      {saved && state.status === "idle" ? <Alert tone="success" className="mb-6">Ekip üyesi eklendi. Aşağıdan düzenlemeye devam edebilirsiniz.</Alert> : null}
      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"} className="mb-6">
          {state.message}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-6">
          <Card title="Kimlik">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ad soyad" name="fullName" required error={e.fullName}>
                <TextInput name="fullName" defaultValue={values.fullName} maxLength={100} error={e.fullName} autoComplete="off" />
              </Field>
              <Field label="Unvan" name="title" required error={e.title} hint="Örn. Kurucu Avukat, Kıdemli Avukat, Avukat.">
                <TextInput name="title" defaultValue={values.title} maxLength={80} error={e.title} />
              </Field>
              <Field className="sm:col-span-2" label="Adres (slug)" name="slug" error={e.slug} hint={<>Profil adresi: <code>/ekibimiz/{values.slug || "ad-soyad"}</code>. Adı değiştirdiyseniz “Adından üret” ile güncelleyin.</>}>
                <SlugField titleName="fullName" generateLabel="Adından üret" defaultValue={values.slug} editing={Boolean(id)} error={e.slug} />
              </Field>
              <Field className="sm:col-span-2" label="Kısa biyografi" name="shortBio" error={e.shortBio} hint="Ekip kartlarında ve profilin üstünde görünür (en fazla 400 karakter).">
                <TextArea name="shortBio" rows={3} defaultValue={values.shortBio} maxLength={400} error={e.shortBio} />
              </Field>
            </div>
          </Card>

          <Card title="Özgeçmiş" description="Ayrıntılı biyografi (isteğe bağlı).">
            <RichTextEditor name="bio" defaultValue={values.bio} minHeightClass="min-h-[14rem]" error={e.bio} placeholder="Ayrıntılı özgeçmiş…" />
          </Card>

          <Card title="Mesleki bilgiler" description="Boş bırakılan alanlar için sitede başlık gösterilmez.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kayıtlı olduğu baro" name="barAssociation" error={e.barAssociation}>
                <TextInput name="barAssociation" defaultValue={values.barAssociation} maxLength={100} error={e.barAssociation} />
              </Field>
              <Field label="Mesleğe başlama tarihi" name="careerStart" error={e.careerStart}>
                <TextInput name="careerStart" type="date" defaultValue={values.careerStart} error={e.careerStart} />
              </Field>
              <Field label="TBB sicil numarası" name="tbbNo" error={e.tbbNo}>
                <TextInput name="tbbNo" defaultValue={values.tbbNo} maxLength={30} error={e.tbbNo} />
              </Field>
              <Field label="Baro sicil numarası" name="barNo" error={e.barNo}>
                <TextInput name="barNo" defaultValue={values.barNo} maxLength={30} error={e.barNo} />
              </Field>
              <Field className="sm:col-span-2" label="Eğitim" name="education" error={e.education} hint="Her satıra bir kayıt (örn. “… Üniversitesi Hukuk Fakültesi, Lisans”).">
                <TextArea name="education" rows={4} defaultValue={values.education} error={e.education} />
              </Field>
              <Field label="Yabancı diller" name="languages" error={e.languages} hint="Her satıra bir dil.">
                <TextArea name="languages" rows={3} defaultValue={values.languages} error={e.languages} />
              </Field>
              <Field label="Yayınlar" name="writings" error={e.writings} hint="Her satıra bir yayın (makale, kitap bölümü vb.).">
                <TextArea name="writings" rows={3} defaultValue={values.writings} error={e.writings} />
              </Field>
              <Field label="E-posta" name="email" error={e.email}>
                <TextInput name="email" type="email" defaultValue={values.email} maxLength={200} error={e.email} autoComplete="off" />
              </Field>
              <Field label="LinkedIn (isteğe bağlı)" name="linkedin" error={e.linkedin} hint="https:// ile başlayan profil adresi.">
                <TextInput name="linkedin" type="url" defaultValue={values.linkedin} maxLength={300} error={e.linkedin} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Fotoğraf">
            <div className="space-y-5">
              <ImageField name="photoId" label="Portre" purpose="PHOTO" initial={values.photo} aspect="aspect-[4/5]" hint="Dikey (4:5 veya 3:4) profesyonel portre önerilir." />
              <Field label="Kadraj (odak noktası)" name="photoPosition" hint="Fotoğraf kırpıldığında hangi bölümün görüneceğini belirler.">
                <Select name="photoPosition" defaultValue={values.photoPosition}>
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="Profilde gösterilecek bölümler" description="İşareti kaldırılan bölüm, dolu olsa bile sitede gösterilmez.">
            <div className="space-y-2.5">
              {VISIBILITY.map((v) => (
                <Checkbox key={v.key} id={`vis-${v.key}`} name="visible" value={v.key} label={v.label} defaultChecked={values.visible.includes(v.key)} />
              ))}
            </div>
          </Card>

          {areas.length ? (
            <Card title="Çalışma alanları">
              <div className="space-y-2.5">
                {areas.map((a) => (
                  <Checkbox key={a.id} id={`area-${a.id}`} name="areaIds" value={a.id} label={a.title} defaultChecked={values.areaIds.includes(a.id)} />
                ))}
              </div>
            </Card>
          ) : null}

          <Card title="Arama motoru (SEO)" description="Boşsa ad, unvan ve kısa biyografi kullanılır.">
            <div className="space-y-5">
              <Field label="SEO başlığı" name="seoTitle" error={e.seoTitle}>
                <TextInput name="seoTitle" defaultValue={values.seoTitle} maxLength={70} error={e.seoTitle} />
              </Field>
              <Field label="SEO açıklaması" name="seoDescription" error={e.seoDescription}>
                <TextArea name="seoDescription" rows={3} defaultValue={values.seoDescription} maxLength={170} error={e.seoDescription} />
              </Field>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
