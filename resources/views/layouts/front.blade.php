{{--
    Front-end layout shell (design-faithful).

    Intentionally thin: each page owns its <head> (title, viewport, Google Fonts,
    and its verbatim inline <style>) via the `head` stack, its body via the
    `content` section, and its verbatim inline <script>s via the `scripts` stack.
    Nothing here restyles the page — the existing static HTML is rendered as-is.
    See architecture/05-blade-integration.md and 06-frontend-asset-strategy.md.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
@stack('head')
</head>
<body>
@yield('content')
@stack('scripts')
</body>
</html>
