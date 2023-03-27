import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Paisen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/img/favicon.png" />

        {/* Google Fonts */}
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />

        {/* Vendor CSS Files */}
        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link
          href="/assets/bootstrap-icons/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/assets/boxicons/css/boxicons.min.css" rel="stylesheet" />
        <link href="/assets/quill/quill.snow.css" rel="stylesheet" />
        <link href="/assets/quill/quill.bubble.css" rel="stylesheet" />
        <link href="/assets/remixicon/remixicon.css" rel="stylesheet" />
        <link href="/assets/simple-datatables/style.css" rel="stylesheet" />

        {/* Template Main CSS File */}
        <link href="/assets/css/style.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Vendor JS Files */}
        <script src="/assets/apexcharts/apexcharts.min.js"></script>
        <script src="/assets/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="/assets/chart.js/chart.umd.js"></script>
        <script src="/assets/echarts/echarts.min.js"></script>
        <script src="/assets/quill/quill.min.js"></script>
        <script src="/assets/simple-datatables/simple-datatables.js"></script>
        <script src="/assets/tinymce/tinymce.min.js"></script>
        <script src="/assets/php-email-form/validate.js"></script>

        {/* Template Main JS File */}
        <script src="/assets/js/main.js"></script>
      </body>
    </Html>
  )
}
