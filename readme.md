// ==UserScript==
// @name         Lesco Bill - User script
// @version      2026-03-01
// @description  Bypasses the captcha and removes the hassle to remember you consumer ID(s) ones for all. Also it lets you send the fetched data to a database of your liking (n8n, webhook etc). Info that it grabs includes Consumer ID, Bill price, Due date, Bill price after due date, Current and Previous meter readings etc
// @author       Dr Ihtsham
// @match        https://www.lesco.gov.pk:36269/Modules/CustomerBillN/CheckBill.asp
// @match        https://www.lesco.gov.pk:36269/Modules/CustomerBillN/CustomerMenu.asp
// @match        https://www.lesco.gov.pk:36260/Bill.aspx
// @icon         https://www.lesco.gov.pk:36269/UIRewamp/new_version/Assets/icons/LESCOLogo%20180x180.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    try {

        // Optionally you can also write names of your Bills so you know which bill you are checking. Leave it empty otherwise to not show any names. IDs will be shown instead (default behaviour)
        let IDsName = []
        // Write your consumer IDs comma seperated below.
        let yourIDs = [1234567, 8910111]
        yourIDs.reverse(); IDsName.reverse()
        let id = document.querySelector('input[name="txtCustID"]') ?? "notFound"
        // console.log(id)

        if (id !== "notFound") {
            createButton()
        } else if (id === "notFound" && window.location.href.includes("CustomerMenu.asp")) {
            // not in main page, write pin or captcha
            fetch('https://www.lesco.gov.pk:36269/Modules/CustomerBillN/codeimage.asp', {
                "Cookie": document.cookie
            })
                .then(response => response)
                .then(data => {
                // console.log(data)
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
            let detailArray = Object.values(document.querySelectorAll("p.ft14")).splice(-7)
            let fourDetails = detailArray.filter(val => val.textContent.search(/^\d+$/) >= 0).sort((a, b) => a.textContent - b.textContent)
            let restOfDetails = detailArray.filter(val => val.textContent.search(/^\d+$/) == -1).sort((a, b) => a.textContent - b.textContent)
            let ft13 = Object.values(document.querySelectorAll(".ft13"))
            let meterReading = ft13.filter(node => {
                return node.style.top.search(/(4|5)(1|2|3)\d/) >= 0 && node.style.left.search(/(1|2|3)\d\d/) >= 0 && node.textContent !== ""
            }).sort((a, b) => a.textContent - b.textContent)
            // console.log(meterReading)

            let billInfo = []
            billInfo.push([
                ["Bill Month", restOfDetails[0].textContent]
            ])
            billInfo.push([
                ["Current Bill", fourDetails[0].textContent+" Rs"]
            ])
            billInfo.push([
                ["Due Date", restOfDetails[1].textContent]
            ])
            billInfo.push([
                ["Bill after due date", fourDetails[1].textContent+" Rs"]
            ])
            billInfo.push([
                ["Customer ID", fourDetails[3].textContent]
            ])
            billInfo.push([
                ["Current reading", meterReading[3].textContent]
            ])
            billInfo.push([
                ["Previous reading", meterReading[2].textContent]
            ])
            billInfo.push([
                ["Consumed unit", meterReading[1].textContent]
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

function showDataInTable(data){

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