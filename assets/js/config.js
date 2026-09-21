/* ===========================================================
   Crown Collision: site configuration

   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Everything the shop is likely to change lives here: the form
   connection, every photo, and the hero video. Nothing else in
   the project has to be touched.

   Full step by step instructions are in the deployment guide
   that came with this project. It is kept outside the repository
   so it never reaches GitHub.
   =========================================================== */

window.CROWN_CONFIG = {

  /* ---------------------------------------------------------
     1. THE BOOKING FORM

     Paste the Google Apps Script web app URL here. It looks like:
     https://script.google.com/macros/s/AKfycbx................/exec

     Until this is filled in the form runs in demo mode: it
     validates and shows the success state but sends nothing.
     That is deliberate, so a half finished site cannot quietly
     swallow a real customer.
     --------------------------------------------------------- */
  formEndpoint: "",

  successMessage: "Thanks. We have your request and will call you back shortly.",
  errorMessage: "That did not go through. Please call the shop at 403 276 9613.",


  /* ---------------------------------------------------------
     2. PHOTOS

     Every picture on the site is listed below. To replace one,
     drop your file into assets/img/ and change the "src" line
     to point at it.

     Any filename works. Any format works: .jpg, .png, .webp,
     .avif. You do not have to match the placeholder name or
     extension, and you do not have to touch index.html.

     Change "alt" too. It is what screen readers announce and
     what shows if the image fails to load, and right now every
     one of them says the image is a placeholder.

     Shapes are what the layout expects. A photo of roughly the
     right proportions will not shift anything. Save at about
     1600px wide, JPG, 80% quality.
     --------------------------------------------------------- */
  images: {

    // 16:9. Still frame behind the hero. Also shows whenever the
    // video is missing or cannot play, so make it a good one.
    heroPoster: {
      src: "assets/img/hero-poster.svg",
      alt: "Placeholder image of the Crown Collision shop"
    },

    // 14:9 pair for the drag to compare slider. Shoot both from
    // the same spot with the same framing or the slider looks odd.
    before: {
      src: "assets/img/before.svg",
      alt: "Placeholder image representing a damaged vehicle"
    },
    after: {
      src: "assets/img/after.svg",
      alt: "Placeholder image representing a repaired vehicle"
    },

    // 7:5. Sits beside the warranty copy.
    shop: {
      src: "assets/img/shop.svg",
      alt: "Placeholder photo of the shop floor"
    },

    // 4:3 each. The job gallery. Captions are in index.html.
    work1: { src: "assets/img/work/work-01.svg", alt: "Placeholder repair photo one" },
    work2: { src: "assets/img/work/work-02.svg", alt: "Placeholder repair photo two" },
    work3: { src: "assets/img/work/work-03.svg", alt: "Placeholder repair photo three" },
    work4: { src: "assets/img/work/work-04.svg", alt: "Placeholder repair photo four" },
    work5: { src: "assets/img/work/work-05.svg", alt: "Placeholder repair photo five" },
    work6: { src: "assets/img/work/work-06.svg", alt: "Placeholder repair photo six" }
  },


  /* ---------------------------------------------------------
     3. HERO VIDEO

     Optional. Leave it as it is and drop your clip in at
     assets/video/hero.mp4, or point this at any other file.
     Set it to "" to turn the video off and use the poster only.

     Ten to twenty seconds, no audio, 1920x1080, under about 4 MB.
     assets/video/README.txt has an ffmpeg command for it.
     --------------------------------------------------------- */
  video: "assets/video/hero.mp4",


  /* ---------------------------------------------------------
     4. CONTACT DETAILS

     Used by the script. Keep these in step with index.html.
     --------------------------------------------------------- */
  phone: "+14032769613",
  phoneDisplay: "403 276 9613",
  email: "info@crowncollisoncalgary.com"
};
