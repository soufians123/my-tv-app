// تم نقل إنشاء المقالات وإدارتها إلى لوحة الإدارة.
// هذه الصفحة تقوم بإعادة التوجيه مباشرة إلى صفحة الإدارة مع فتح نافذة إنشاء مقال.

export default function ArticlesCreateRedirect() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/admin/articles?open=create',
      permanent: true,
    },
  }
}