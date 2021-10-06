async function japanreadScraper() {
  var tempMangas = [];
  // setTimeout(() => {
  //   message("japanreadScraper")
  // }, 0);
  mangas = [];
  const browser = await puppeteer.launch({ headless: true }); //headless false permet de démarer une instance visible de chromium
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  // se faire passer pour un navigateur
  page.setUserAgent(
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0"
  );
  await page.goto(`https://www.japanread.cc`, {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
  }); //se rendre sur une page
  await page.screenshot({ path: "buddy-screenshot.png" });
  tempMangas = await page.evaluate(() => {
    let tbody = document.querySelector(
      "body > section > div > div > div.col-lg-9 > div.table-responsive > table > tbody"
    );
    let trs = [];

    trs = tbody.querySelectorAll("tr");

    let hugeArray = [];
    let title = "";
    // huge = tbody.innerHTML;
    for (tr of trs) {
      let tempTitle = "";
      if (tr.className == "manga") {
        tempTitle = tr
          .querySelector("tr > td  > span > a")
          .innerText.replaceAll("\\t", "");
        title = tempTitle;
        page++;
      } else {
        let chaps = [];
        try {
          chaps = tr.querySelectorAll("tr > td:nth-child(2) > a");
        } catch (error) {
          test = error;
        }

        let timer = tr.querySelectorAll("tr > td:nth-child(7) > time");

        let teams = tr.querySelectorAll(
          "tr > td.d-none.d-sm-table-cell.text-truncate > a"
        );
        trueTeam = "";
        if (teams[0]?.innerText == null) {
          trueTeam = "not";
        } else {
          if (teams.length > 1) {
            for (team of teams) {
              if (trueTeam.length > 1) {
                trueTeam += "/" + team.innerText;
              } else {
                trueTeam = team.innerText;
              }
            }
          } else {
            trueTeam = teams[0]?.innerText;
          }
        }
        if (trueTeam.includes("team clachoufoufou")) {
          let timerArray = timer[0].innerText
            .replace(/[\s-]+$/, "")
            .split(/[\s-]/);
          if (timerArray[1] === "s" || timer[0].innerText.includes("min")) {
            if (
              (timerArray[1] == "min" && timerArray[0] <= 17) ||
              timerArray[1] == "s"
            ) {
              hugeArray.push({
                chapTitle: title,
                chap: chaps[0].innerText,
                chapLinks: chaps[0].href,
                chapTimer: timer[0].innerText,
                chapTeam: trueTeam,
              });
            }
          }
        }
      }
    }
    return hugeArray;
  });
  // console.log("");
  // console.log("Manga que je récupère");
  // console.log(tempMangas);
  // console.log("");

  if (tempMangas.length != 0) {
    for (manga of tempMangas) {
      if (
        overallTableOfExits.find(
          (Title) => Title.chapTitle === manga.chapTitle
        ) &&
        overallTableOfExits.find((chap) => chap.chap === manga.chap) &&
        overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks)
      ) {
        // console.log("Le chap y est");
      } else {
        // console.log("le chap y est pas !");
        mangas.push({
          chapTitle: manga.chapTitle,
          chap: manga.chap,
          chapLinks: manga.chapLinks,
        });
      }
    }
  }
  if (mangas.length >= 1) {
    for (manga of mangas) {
      if (
        overallTableOfExits.find(
          (Title) => Title.chapTitle === manga.chapTitle
        ) &&
        overallTableOfExits.find((chap) => chap.chap === manga.chap) &&
        overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks)
      ) {
        // console.log(
        //   "Le manga existe déjà dans le tableau overallTableOfExists"
        // );
      } else {
        overallTableOfExits.push({
          chapTitle: manga.chapTitle,
          chap: manga.chap,
          chapLinks: manga.chapLinks,
        });
      }
    }
    // console.log("Tableau sortie actuelle :");
    // console.log(mangas);
    // console.log("Tableau complet");
    // console.log(overallTableOfExits);
    setTimeout(generateEmbedForMangas, 0);
  } else {
    // console.log("Pas de nouveauté de la team clachoufoufou");
  }
  await browser.close();
  // setTimeout(infoSiteWeb, 15 * 60 * 1000);
  setTimeout(japanreadScraper, 1 * 60 * 1000);
}
module.exports = { japanreadScraper };
