// ==UserScript==
// @name         Lesco Bill - User script
// @version      2026 June, 17 = v2
// @description  Bypasses the captcha and removes the hassle to remember you consumer ID(s) ones for all. Also it lets you send the fetched data to a database of your liking (n8n, webhook etc). Info that it grabs includes Consumer ID, Bill price, Due date, Bill price after due date, Current and Previous meter readings etc
// @author       Dr Ihtsham
// @include        https://www.lesco.gov.pk:36269/Modules/CustomerBillN/CheckBill.asp
// @include        https://www.lesco.gov.pk:36269/Modules/CustomerBillN/CustomerMenu.asp
// @include        https://www.lesco.gov.pk:36260/Bill.aspx
// @include        https://*lesco*
// @icon         https://dub.lesco.gov.pk:36269/favicon.ico
// @grant        none
// ==/UserScript==


/*
----- March 4 2026 =  v1 -----
First release.
Had old url which was https://www.lesco.gov.pk:36269/Modules/CustomerBillN/
Had old design of bill, too
Old class name for useful items was .ft13
---- June 17 2026 = v2 ------
Shifted to new origin: https://dub.lesco.gov.pk:36269/Modules/CustomerBillN/
Using @include in metadata so as to avoid future conflicts where lesco changes there design/url
To avoid the captcha/or autofilling, it used to go fetch from static url. So if origin changes, the script starts to give CORS error due to autofilling of captcha is failed. In this version i have used window.location.href to get latest origin and avoid conflicts
The bill design is updated, therefore i have got to update, how it fetches the bill information from web/html
New bill design has everything useful in .ft14
Discarded the use of detailArray, restOfDetails, fourDetails variable and GETTING everything from meterReadingvariable based on new top and left style positions.
Everyhting is saved into billInfo array as v1
*/


(function () {
  'use strict';
  try {

    // Optionally you can also write names of your Bills so you know which bill you are checking. Leave it empty otherwise to not show any names. IDs will be shown instead (default behaviour)
    let IDsName = ["", ""]
    // Write your consumer IDs comma seperated below.
    let yourIDs = ["", ""]
    yourIDs.reverse(); IDsName.reverse()
    let id = document.querySelector('input[name="txtCustID"]') ?? "notFound"
    // console.log(id)

    if (id !== "notFound") {
      createButton()
    } else if (id === "notFound" && window.location.href.includes("CustomerMenu.asp")) {
      // not in main page, write pin or captcha
        // on 17 June 2026, the lesco website got updated and they added dub to their href; hence from now on, extract the href and them send the fetch to the current url to avoid cors err.
        // old; before 17 june: https://www.lesco.gov.pk:36269/Modules/CustomerBillN/codeimage.asp
        // new; after 17 june: https://dub.lesco.gov.pk:36269/Modules/CustomerBillN/codeimage.asp
        let currentOrigin = new URL(window.location.href).origin + "/Modules/CustomerBillN/codeimage.asp"
      fetch(currentOrigin, {
        "Cookie": document.cookie
      })
        .then(response => response)
        .then(data => {
          console.log(data)
          let u = new URL(data.url)
          let code = u.search.match(/(?<=code\=)[\w|\d]{4}/).toString()
          document.querySelector("input[name='code']").value = code;
          let btn3 = document.querySelectorAll("button")
          btn3 = Object.values(btn3).filter(n => n.textContent.includes("View/")
          )
          btn3[0].click()
        })
        .catch(error => console.error('Error fetching data:', error));

    }

    if (window.location.href.includes("Bill.aspx")) {
        // v1 was .ft14 now in v2 its ft13
      let detailArray = Object.values(document.querySelectorAll("p.ft13")).splice(-7)
      let fourDetails = detailArray.filter(val => val.textContent.search(/^\d+$/) >= 0).sort((a, b) => a.textContent - b.textContent)
      // let restOfDetails = detailArray.filter(val => val.textContent.search(/^\d+$/) == -1).sort((a, b) => a.textContent - b.textContent)
      // console.log(fourDetails, restOfDetails)
      // in v1, value inside parenthesis was .ft13 which got updated to .ft14 in v2. No changing variable name because it maybe used somewhere else.
      let ft13 = Object.values(document.querySelectorAll(".ft14"))
      // console.log(ft13)
      // v1 return statment: return node.style.top.search(/(4|5)(1|2|3)\d/) >= 0 && node.style.left.search(/(1|2|3)\d\d/) >= 0 && node.textContent !== ""
      let meterReading = ft13.filter(node => {
        return node.style.top.search(/(2|3|4)(1|7|3|8|9)\d/) >= 0 && node.style.left.search(/(1|3|5|6|7)\d\d/) >= 0 && node.textContent !== ""
      }).sort((a, b) => a.textContent - b.textContent)
      console.log(meterReading)

      let billInfo = []
      billInfo.push([
        ["Bill Month", meterReading[6].textContent]
      ])
      billInfo.push([
        ["Current Bill", meterReading[10].textContent + " Rs"]
      ])
      billInfo.push([
        ["Due Date", meterReading[9].textContent]
      ])
      billInfo.push([
        ["Bill after due date", meterReading[11]?.textContent + " Rs"]
      ])
      billInfo.push([
        ["Customer ID", Object.values(document.querySelectorAll(".ft14")).filter(function(node){ return node.style.top.includes("242") && node.style.left.includes("60") })[0].textContent
        ]
      ])
      billInfo.push([
        ["Current reading", meterReading[4].textContent]
      ])
      billInfo.push([
        ["Previous reading", meterReading[3].textContent]
      ])
      billInfo.push([
        ["Consumed unit", meterReading[2].textContent]
      ])
      console.table(billInfo)
      console.log(billInfo)
      showDataInTable(billInfo)

      // billInfo variable contains the final end data that can then be transferred to the database of your liking
      // fetch()
    }


    function createButton() {

      // throwing styles
      let s = document.createElement("style")
      s.textContent = `
        .metersIDs {
        cursor: pointer;
        border-radius: 5%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: black;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-right: 2px solid blue;
        border-bottom: 2px solid blue;
        padding: 5px;
        margin: 5px;
        float: left;
        width: 100px;
        }

        .userScript {
            display: flex;
            flex-direction: column;
            align-items: end;
            justify-content: center;
            position: fixed;
            right: 10px;
            min-width: 2vw;
            z-index: 1000000000;
            top: 60px;

    }

`
      document.head.append(s)
      let userScriptDiv = document.createElement("div")
      userScriptDiv.className = "userScript"
      document.body.append(userScriptDiv)



      yourIDs.forEach((val, index) => {
        let name = val
        if (IDsName.length > 0) name = IDsName[index]
        userScriptDiv.insertAdjacentHTML("afterbegin", `
        <div class="metersIDs" data-id=${val}>${name}</div>
`)

        document.addEventListener("click", function (e) {
          if (e.target.className.includes("metersIDs")) {
            id.value = e.target.dataset.id
            let btn2 = document.querySelector("form[name='form2']").querySelector("input[type='submit']")
            btn2.click()
          }
        })



      })

    }

    function showDataInTable(data) {

      let ts = document.createElement("style")
      ts.textContent = `
.table-wrapper {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}

.bill-table {
  border-collapse: collapse;
  width: 100%;
  font-family: Arial, sans-serif;
  table-layout: fixed;
}

.bill-table th,
.bill-table td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: center;
}

.bill-table thead tr {
  background-color: #4CAF50;
  color: white;
}

.bill-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.bill-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.bill-table td:first-child {
  font-weight: bold;
  text-align: left;
  padding-left: 16px;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: #ff4d4d;
  color: white;
  border: none;
  font-size: 18px;
  font-weight: bold;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
}

.close-btn:hover {
  background: #e60000;
}

.highlight-bill {color: red}
`
      document.head.append(ts)

      document.body.insertAdjacentHTML("beforeend", `<center>
  <div class="table-wrapper" id="billTableWrapper">
    <button class="close-btn" onclick="document.getElementById('billTableWrapper').style.display='none'">×</button>
    <table class="bill-table">
      <thead>
        <tr>
          <th>Consumer ID</th>
          <th>${data[4][0][1]}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data[0][0][0]}</</td>
          <td>${data[0][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[1][0][0]}</</td>
          <td class="highlight-bill">${data[1][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[2][0][0]}</</td>
          <td class="highlight-bill">${data[2][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[3][0][0]}</</td>
          <td>${data[3][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[5][0][0]}</td>
          <td>${data[5][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[6][0][0]}</td>
          <td>${data[6][0][1]}</</td>
        </tr>
        <tr>
          <td>${data[7][0][0]}</</td>
          <td>${data[7][0][1]}</</td>
        </tr>
      </tbody>
    </table>
  </div>
</center>`)
    }


  }
  catch (err) {
    console.error(err)
  }

})();