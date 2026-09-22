/**
 * Çalışma alanları — başlangıç içeriği. Tümü yönetim panelinden düzenlenebilir.
 * Metinler genel bilgilendirme niteliğindedir; "uzman", "en iyi", "başarı", "garanti" gibi ifadeler bilinçli olarak kullanılmamıştır.
 * Yayına almadan önce LRN Hukuk tarafından gözden geçirilmesi önerilir.
 */
export type SeedArea = {
  slug: string;
  title: string;
  shortDescription: string;
  topics: string[];
  content: string;
};

const closing = (topic: string) =>
  `<h2>Çalışma biçimimiz</h2><p>${topic} alanındaki her dosya, kendi olguları, belgeleri ve süreleri çerçevesinde ayrı ayrı değerlendirilir. Hukuki durum ve süreç, ilgili kişiye anlaşılır bir dille aktarılır. Bir sürecin nasıl sonuçlanacağı olayın özelliklerine, delillere ve uygulanacak mevzuata bağlıdır; bu nedenle sonuca ilişkin bir öngörüde veya vaatte bulunulmaz.</p>`;

export const PRACTICE_AREAS: SeedArea[] = [
  {
    slug: "is-ve-sosyal-guvenlik-hukuku",
    title: "İş ve Sosyal Güvenlik Hukuku",
    shortDescription: "İş ilişkisinden doğan uyuşmazlıklar ile sosyal sigorta ve sosyal güvenlik işlemlerine ilişkin hukuki süreçler.",
    topics: [
      "İş sözleşmelerinin kurulması ve sona ermesi",
      "İşe iade",
      "Kıdem ve ihbar tazminatı",
      "Fazla çalışma, ücret ve diğer işçilik alacakları",
      "İş kazası ve meslek hastalığı",
      "Hizmet tespiti ve sigortalılık",
      "SGK işlemleri ve emeklilik",
      "İşyeri uygulamaları ve işveren yükümlülükleri",
    ],
    content: `<h2>Kapsam</h2><p>İş hukuku; işçi ile işveren arasındaki ilişkiyi, bu ilişkiden doğan hak ve yükümlülükleri düzenler. Sosyal güvenlik hukuku ise sigortalılık, prim yükümlülükleri ve sosyal sigorta yardımlarına ilişkin kuralları kapsar. İki alan çoğu zaman birbiriyle iç içe ilerler: örneğin bir iş kazası hem işçilik alacakları hem de sosyal güvenlik yardımları bakımından değerlendirilmesi gereken bir olaydır.</p><h2>Süreler ve belgelerin önemi</h2><p>İş hukukunda birçok hakkın kullanılması, kanunda öngörülen sürelere bağlıdır; işe iade gibi başvurularda kısa hak düşürücü süreler bulunabilir. Bu nedenle uyuşmazlık ortaya çıktığında iş sözleşmesi, ücret bordroları, işyeri kayıtları ve yazışmalar gibi belgelerin ve sürelerin erken aşamada değerlendirilmesi önem taşır.</p>${closing("İş ve sosyal güvenlik hukuku")}`,
  },
  {
    slug: "ceza-hukuku",
    title: "Ceza Hukuku",
    shortDescription: "Soruşturma ve kovuşturma aşamalarında müdafilik, mağdur ve katılan vekilliği ile ceza yargılamasına ilişkin hukuki süreçler.",
    topics: [
      "Soruşturma aşamasında hukuki yardım",
      "Şüpheli ve sanık müdafiliği",
      "Mağdur ve katılan vekilliği",
      "Tutuklama ve adli kontrol",
      "Uzlaştırma ve etkin pişmanlık",
      "Kanun yolları (istinaf ve temyiz)",
      "İnfaz hukuku",
      "Delillerin toplanması ve değerlendirilmesi",
    ],
    content: `<h2>Kapsam</h2><p>Ceza hukuku; hangi fiillerin suç sayıldığını ve bunlara bağlanan yaptırımları düzenleyen maddi ceza hukuku ile yargılamanın nasıl yürütüleceğini belirleyen ceza muhakemesi hukukunu kapsar. Süreç, çoğunlukla bir şikâyet veya ihbarla başlayan soruşturma aşamasıyla, iddianamenin kabulünden sonra kovuşturma aşamasıyla ve gerektiğinde kanun yollarıyla devam eder.</p><h2>Savunma ve katılım hakları</h2><p>Şüpheli, sanık, mağdur ve suçtan zarar gören kişinin usul hukukundan doğan hakları vardır. Bu hakların zamanında ve doğru biçimde kullanılması, sürecin hukuka uygun yürütülmesi bakımından önem taşır. Soruşturma dosyasına erişim, ifade verme ve delillerin değerlendirilmesi gibi konular her dosyada ayrıca ele alınır.</p>${closing("Ceza hukuku")}`,
  },
  {
    slug: "saglik-hukuku",
    title: "Sağlık Hukuku",
    shortDescription: "Sağlık hizmetinin sunumundan doğan hukuki sorumluluk, hasta hakları ve sağlık personeline ilişkin hukuki süreçler.",
    topics: [
      "Hasta hakları ve aydınlatılmış onam",
      "Tıbbi müdahaleden doğan hukuki sorumluluk",
      "Sağlık personelinin hukuki durumu",
      "Sağlık kuruluşlarına ilişkin hukuki süreçler",
      "Disiplin ve idari soruşturmalar",
      "Tazminat talepleri",
      "Tıbbi belge ve kayıtlara erişim",
      "Sağlık mevzuatı",
    ],
    content: `<h2>Kapsam</h2><p>Sağlık hukuku; sağlık hizmetinin sunulması sırasında hasta, sağlık çalışanı ve sağlık kuruluşu arasındaki ilişkileri düzenleyen kuralları kapsar. Alan; özel hukuk, ceza hukuku ve idare hukuku ile kesişir. Bu nedenle aynı olay hem tazminat, hem disiplin, hem de ceza hukuku bakımından değerlendirilmesi gereken sonuçlar doğurabilir.</p><h2>Belge ve kayıtların önemi</h2><p>Bu alandaki uyuşmazlıklarda hasta dosyası, onam formları, tıbbi kayıtlar ve bilirkişi incelemeleri belirleyici rol oynar. Söz konusu belgelerin usulüne uygun biçimde temin edilmesi ve teknik bilgi gerektiren hususların hukuki açıdan doğru ifade edilmesi süreç bakımından önemlidir.</p>${closing("Sağlık hukuku")}`,
  },
  {
    slug: "sirketler-hukuku",
    title: "Şirketler Hukuku",
    shortDescription: "Şirketlerin kuruluşu, yönetimi, ortaklık ilişkileri ve şirket yapısında yapılan değişikliklere ilişkin hukuki süreçler.",
    topics: [
      "Şirket kuruluşu ve şirket türünün seçimi",
      "Ana sözleşme ve pay sahipleri sözleşmeleri",
      "Genel kurul ve yönetim kurulu işlemleri",
      "Pay devri ve sermaye değişiklikleri",
      "Ortaklar arası uyuşmazlıklar",
      "Yönetici sorumluluğu",
      "Birleşme, bölünme ve tür değiştirme",
      "Şirketin sona ermesi ve tasfiye",
    ],
    content: `<h2>Kapsam</h2><p>Şirketler hukuku; anonim, limited ve diğer ticaret şirketlerinin kuruluşunu, organlarını, ortaklar arasındaki ilişkileri ve şirketin sona ermesine kadar uzanan süreci düzenler. Şirket yapısını ilgilendiren kararlar çoğu zaman kanun ve ana sözleşme hükümlerinin birlikte değerlendirilmesini gerektirir.</p><h2>Şirket içi süreçler</h2><p>Genel kurul toplantılarının yapılması, yönetim organının kararları, pay devirleri ve sermaye değişiklikleri gibi işlemlerin geçerliliği; şekil şartlarına ve toplantı ve karar nisaplarına uyulmasına bağlıdır. Bu tür işlemlerin planlanması ve kayıt altına alınması, ileride doğabilecek uyuşmazlıkların önlenmesi bakımından önem taşır.</p>${closing("Şirketler hukuku")}`,
  },
  {
    slug: "ticaret-hukuku",
    title: "Ticaret Hukuku",
    shortDescription: "Ticari ilişkiler, ticari sözleşmeler, kıymetli evrak ve ticari uyuşmazlıklara ilişkin hukuki süreçler.",
    topics: [
      "Ticari sözleşmelerin hazırlanması ve incelenmesi",
      "Ticari alacaklar ve takip süreçleri",
      "Çek, bono ve diğer kıymetli evrak",
      "Bayilik ve distribütörlük ilişkileri",
      "Haksız rekabet",
      "Ticari defterler ve tacir yükümlülükleri",
      "Ticari işletmenin devri",
      "Ticari uyuşmazlıklarda arabuluculuk ve yargı yolu",
    ],
    content: `<h2>Kapsam</h2><p>Ticaret hukuku; tacirlerin faaliyetlerini, ticari işletmeyi, ticari sözleşmeleri ve kıymetli evrakı düzenleyen kuralları kapsar. Ticari ilişkilerde yazılı belgeler, sözleşme hükümleri ve tarafların fiili uygulamaları uyuşmazlıkların çözümünde belirleyici olur.</p><h2>Sözleşmeler ve süreler</h2><p>Ticari sözleşmelerde tarafların hak ve yükümlülüklerinin açık biçimde belirlenmesi, ileride doğabilecek anlaşmazlıkların kapsamını daraltır. Kıymetli evrak ve ticari alacaklara ilişkin işlemlerde ise zamanaşımı ve ibraz süreleri gibi hususlar ayrıca değerlendirilir. Bazı ticari uyuşmazlıklarda dava açmadan önce arabuluculuğa başvurulması zorunlu olabilir.</p>${closing("Ticaret hukuku")}`,
  },
  {
    slug: "aile-hukuku",
    title: "Aile Hukuku",
    shortDescription: "Evlilik birliğinin sona ermesi, çocuğa ilişkin düzenlemeler, mal rejimi ve aile içi korumaya ilişkin hukuki süreçler.",
    topics: [
      "Anlaşmalı ve çekişmeli boşanma",
      "Velayet ve kişisel ilişki kurulması",
      "Nafaka",
      "Mal rejiminin tasfiyesi",
      "Soybağı ve tanıma",
      "Evlat edinme",
      "Aile içi şiddete karşı koruma tedbirleri",
      "Aile konutu ve eşyaya ilişkin uyuşmazlıklar",
    ],
    content: `<h2>Kapsam</h2><p>Aile hukuku; evlilik, boşanma, çocuk ile ana-baba arasındaki ilişkiler, nafaka, mal rejimi ve soybağı gibi kişisel ve ailevi durumları düzenler. Bu alandaki dosyalar hukuki yönlerinin yanında taraflar için yoğun kişisel sonuçlar da taşıdığından süreç özenli ve ölçülü biçimde yürütülmelidir.</p><h2>Çocuğun yararı ve mali sonuçlar</h2><p>Çocuğa ilişkin konularda (velayet, kişisel ilişki, nafaka) çocuğun yararı esas alınır. Boşanma sürecinin mal rejimi, nafaka ve tazminat gibi mali sonuçları ise eşlerin mal varlığına ve evlilik süresince yapılan işlemlere göre ayrıca değerlendirilir. Aile içi şiddet halinde koruma tedbirlerine ilişkin başvurular için özel usuller bulunmaktadır.</p>${closing("Aile hukuku")}`,
  },
  {
    slug: "idare-hukuku",
    title: "İdare Hukuku",
    shortDescription: "İdarenin işlem ve eylemlerine karşı başvuru yolları, idari yargı ve kamu hukukuna ilişkin süreçler.",
    topics: [
      "İptal davaları",
      "Tam yargı davaları",
      "Yürütmenin durdurulması",
      "Kamu personeli hukuku",
      "İmar, planlama ve kamulaştırma",
      "Kamu ihaleleri",
      "İdari para cezaları ve yaptırımlar",
      "İdari başvuru ve dava açma süreleri",
    ],
    content: `<h2>Kapsam</h2><p>İdare hukuku; kamu kurum ve kuruluşlarının işlem ve eylemlerini, bunların hukuka uygunluğunu ve bireylerle idare arasındaki ilişkileri düzenler. İdarenin bir işlemine karşı hukuki yollara başvurulması çoğunlukla idari yargı yerlerinde görülen iptal ve tam yargı davaları aracılığıyla gerçekleşir.</p><h2>Süreler</h2><p>İdari işlemlere karşı dava açma süreleri kısa olabilir ve sürenin başlangıcı işlemin tebliğ veya ilan edilmesine bağlıdır. Bazı işlemlerde dava açmadan önce idari başvuru yolu izlenmesi gerekir. Bu nedenle idari bir işlemle karşılaşıldığında ilgili belgenin ve tebliğ tarihinin erken aşamada incelenmesi önem taşır.</p>${closing("İdare hukuku")}`,
  },
];

export const DEFAULT_CATEGORIES = [
  ...PRACTICE_AREAS.map((a) => ({ name: a.title, slug: a.slug, areaSlug: a.slug })),
  { name: "Genel", slug: "genel", areaSlug: null as string | null },
];
