import { NextResponse } from 'next/server'
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  return NextResponse.next()
  /*
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // حراسة مسارات الإدارة
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session } } = await supabase.auth.getSession()

      // ملاحظة مهمة:
      // في بيئة Pages Router مع استخدام supabase-js فقط في الواجهة، قد لا تُكتب الكوكيز اللازمة للميدلوير.
      // لذلك لا نعيد التوجيه إذا لم نجد جلسة، ونترك التحقق لمكوّن AdminLayout على الواجهة.
      if (!session || !session.user) {
        return res
      }

      // إذا وُجدت جلسة، نتحقق من الدور لمنع الوصول غير المصرّح به مباشرة من السيرفر
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError) {
        return res
      }

      if (!profile || String(profile.role || '').toLowerCase() !== 'admin') {
        const redirectUrl = new URL('/', req.url)
        redirectUrl.searchParams.set('message', 'غير مصرح لك بالوصول إلى لوحة الإدارة')
        return NextResponse.redirect(redirectUrl)
      }

      return res
    } catch (error) {
      // في حالة الخطأ أيضاً نسمح بالمتابعة ونترك التحقق للواجهة
      return res
    }
  }

  return res
  */
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}