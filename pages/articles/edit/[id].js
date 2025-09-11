export default function RedirectEditArticle() {
  // This page is deprecated in favor of the admin editor
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/admin/articles',
      permanent: false,
    },
  }
}