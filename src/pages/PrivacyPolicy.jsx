import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import Seo from '../components/common/Seo'

function PrivacyPolicy() {
  return (
    <Layout>
      <Seo
        title="حریم خصوصی | نزدیکو"
        description="سیاست حریم خصوصی نزدیکو درباره نحوه جمع‌آوری، استفاده، نگهداری و نمایش اطلاعات کاربران و خدمات‌دهندگان در سایت."
        canonical="https://nazdikoo.com/privacy-policy"
      />

      <PageHero
        title="حریم خصوصی"
        subtitle="نحوه جمع‌آوری، استفاده و نگهداری اطلاعات کاربران و خدمات‌دهندگان در نزدیکو."
      />

      <section className="bg-slate-50 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-6 shadow-sm md:p-10">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Privacy Policy
          </span>

          <h1 className="mt-5 text-3xl font-bold text-slate-800 md:text-5xl">
            سیاست حریم خصوصی نزدیکو
          </h1>

          <div className="mt-8 space-y-8 text-base leading-8 text-slate-600">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                اطلاعاتی که جمع‌آوری می‌کنیم
              </h2>
              <p>
                هنگام ثبت خدمات، اطلاعاتی مانند عنوان کسب‌وکار، توضیحات، شماره
                تماس، واتساپ، ایمیل، آدرس، موقعیت مکانی و تصاویر دریافت می‌شود.
                این اطلاعات برای نمایش بهتر خدمات و کمک به کاربران در پیدا کردن
                خدمات مناسب استفاده می‌شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                نحوه استفاده از اطلاعات
              </h2>
              <p>
                اطلاعات ثبت‌شده برای ایجاد صفحه خدمات، نمایش عمومی پس از تایید،
                ارتباط بهتر کاربران با خدمات‌دهندگان و بهبود کیفیت تجربه کاربری
                استفاده می‌شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                نگهداری و امنیت اطلاعات
              </h2>
              <p>
                ما تلاش می‌کنیم اطلاعات ثبت‌شده در محیطی امن نگهداری شوند. با این
                حال، هیچ سرویس اینترنتی امنیت صددرصدی را تضمین نمی‌کند و کاربران
                نیز باید در ارائه اطلاعات حساس دقت کافی داشته باشند.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                اشتراک‌گذاری اطلاعات
              </h2>
              <p>
                اطلاعات عمومی ثبت خدمات مانند عنوان، توضیح، شهر، آدرس، شماره تماس
                و تصاویر، در صورت تایید برای کاربران سایت قابل مشاهده خواهند بود.
                اطلاعاتی که ماهیت خصوصی دارند بدون ضرورت و دلیل مشخص در اختیار
                اشخاص ثالث قرار نمی‌گیرند.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                بروزرسانی قوانین
              </h2>
              <p>
                این صفحه ممکن است در آینده بروزرسانی شود. ادامه استفاده از سایت
                به معنی پذیرش نسخه جدید این قوانین خواهد بود.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default PrivacyPolicy