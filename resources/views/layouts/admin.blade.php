{{--
    Admin layout shell (design-faithful).

    Thin by design: each admin page owns its <head> (title, viewport, fonts and
    its verbatim inline <style>) via the `head` stack and its full body via the
    `content` section. The admin chrome (sidebar/topbar) is built by the existing
    admin-sidebar.js / admin-topbar.js / theme-manager.js, loaded unchanged from
    /js. Nothing here restyles the page. See architecture/05-blade-integration.md.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
@stack('head')
</head>
<body>
@yield('content')
</body>
</html>
