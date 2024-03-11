let utils = {}; //create a namespace for our utility functions

//get function to make an HTTP GET request
utils.get = (url) => {

    //start promise object
    return new Promise(function (resolve, reject) {

        //create a new XMLHttpRequest object
        let request = new XMLHttpRequest();

        //initialize the request
        request.open('GET', url);

        request.onload = function () {
            //resolve on success
            if (request.status == 200) { // HTTP: OK
                console.log('Response OK');
                resolve(request.response);
            }
            //reject on error
            else {
                reject(Error(`promise error with ${request.status}`))
            }
        };
        //handle network errors
        request.onerror = function (error) {
            reject(Error(`Network Error with ${url}: ${error}`))
        };
        //send the request
        request.send();
    }); //end Promise Object
}

//getJSON function to get JSON data from the server
utils.getJSON = async function (url) {
    let string = null;
    //get the JSON string from the server
    try {
        string = await utils.get(url);
    }
    catch (error) {
        console.log(error)
    }
    //parse the JSON string and return the data
    let data = JSON.parse(string);
    return data;
}

async function init() {
    updateTable();
    //get the root element of the web page
    let root = document.querySelector('#root');
    if (!root) return
    //create a variable to hold the URL of the JSON data source
    let url = 'https://api-demo.cartwebapp.com/data/2024';

    //create a variable to hold the JSON data
    let occupations = null;

    //try to retrieve the JSON data from the server
    try {
        //retrieve the JSON data from the server
        occupations = await utils.getJSON(url);
    }
    //catch any errors and display them in the root element
    catch (error) {
        root.style.color = 'red';
        root.textContent = `error: ${error}`;
    }

    //show JSON data on the html page
    root.innerHTML = buildList(occupations);
}

function buildList(jobs) {
    //create an empty string to hold the HTML
    let html = '';

    //loop through the array of job objects retrieved from the JSON data
    for (let job of jobs) {

        //start an HTML section for each job
        html += '<section>';

        /* An alternative way of looping through each item in the data, not as useful for this assignment but something to keep in mind for a story? ... */
        //loop through each entry and create a div for each key:value pair
        // for (let key in job) {
        //     html += `<div><strong>${key}</strong>: ${job[key]}</div > `;
        // }

        //create a div element for the job title
        html += `<div><strong>Occupation</strong>: ${job.occupation}</div>`;
        //create a div element for the salary and format it as currency
        html += `<div><strong>Salary</strong>: $${job.salary.toLocaleString('en-US')}</div>`;
        //close the section
        html += '</section>';
    }

    //return the completed html
    return html;
}
//initialize the web page when the DOM is ready


function hide(a, b) {
    document.getElementById(a).classList.toggle("hidden");
    document.getElementById(b).classList.toggle("hidden");
}

function getFormData(...ids) {
    let data = [];
    for (const id of ids) {
        const formTarget = document.getElementById(id);
        if (!formTarget) { console.error(`Form id "${id}" could not be found on the DOM`); return data };
        const formData = new FormData(formTarget);
        formEntires = Object.fromEntries(formData);

        data.push(formEntires);
    }
    return data;
}
//This thang is silly *dies*
function updateChart(chart, data) {
    chart.data = data;
    chart.update();
}
function buildChart(id, data) {
    const context = document.getElementById(id);
    if (!context) return console.error(`Canvas id "${id}" could not be found on the DOM`);
    const chart = new Chart(context, data);
    console.log(`Success! Chart on id "${id}"`, chart)
    return chart
}


function buildTableRow(tds, sign = "$") {
    let trs = []
    for (const td of tds) {
        const newtr = document.createElement("tr");
        const newth = document.createElement("th");
        const dollar = document.createElement("td");
        const newtd = document.createElement("td");
        newth.innerText = td[0].replaceAll("-", " ");
        dollar.innerText = sign

        newtd.innerText = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 1, minimumFractionDigits: 2 }).format(td[1]);
        newtr.appendChild(newth);
        newtr.appendChild(dollar);
        newtr.appendChild(newtd);
        trs.push(newtr);
    }
    return trs;
}

function updateTable(chart) {

    let data = getFormData("form1", "form2");
    if (data.length == 0) return;
    let dataArray0 = Object.entries(data[0]);
    let dataArray1 = Object.entries(data[1]);
    if (chart) {
        let chartData = {
            padding: 30,
            labels: dataArray1.map(slice => slice[0]),

            datasets: [{
                data: dataArray1.map(slice => slice[1]),
                borderColor: "#FFFFFF",
                borderWidth: 1,
                hoverOffset: 30
            }]
        };
        updateChart(chart, chartData);
    }
    let table = document.getElementById("breakdown");
    let income = document.getElementById("incometbody");
    let calc = document.getElementById("calctbody");
    let expenses = document.getElementById("expensestbody");

    for (const deduction of dataArray0) {
        console.log(deduction);
    }
    let deductions = dataArray0.slice(1);

    // cleaneddeduc.splice(0,1)
    let grossyear = dataArray0.slice(0, 1);
    let grossmonth = Math.round((grossyear[0][1] / 12) * 100) / 100;
    grossyear.push(["gross-monthly-income", grossmonth])
    income.replaceChildren(...buildTableRow(grossyear));
    let medicare = deductions.pop();
    medicare[1] = -(+medicare[1]);
    deductions = deductions.map((field)=>{
        console.log(field)
        field[0] += ` (${field[1]}%)`
        field[1] = `-${+grossmonth*(field[1]/100)}`
        return field
    })
    calc.replaceChildren(...buildTableRow(deductions, "$"));
    calc.appendChild(...buildTableRow([medicare]));
    let payrolltotal = deductions.map(e=>e[1]).reduce((a,b)=>{return (+a)+(+b)});
    payrolltotal+=medicare[1];
    console.log(payrolltotal);
    calc.appendChild(...buildTableRow([["total-payroll-deductions",payrolltotal]]));
    calc.appendChild(...buildTableRow([["Net Monthly Income",grossmonth+payrolltotal]]));
    const expensesdata = dataArray1.map((expense)=>{
        return [expense[0],-expense[1]]
    })
   
    expenses.replaceChildren(...buildTableRow(expensesdata));
    const bdbody = document.getElementById("bdbody");
    const expensed = expensesdata.map(e=>e[1]).reduce((a,b)=>{return (+a)+(+b)});
    bdbody.lastElementChild.lastElementChild.innerText = grossmonth+payrolltotal+expensed;
    bdbody.firstElementChild.lastElementChild.innerText = ""
}

document.addEventListener("DOMContentLoaded", function () {
    init();
    let data = getFormData("form1", "form2");
    if (data.length == 0) return;
    let dataArray = Object.entries(data[1]);
    let chartData = {
        labels: dataArray.map(slice => slice[0][0].toUpperCase()+slice[0].slice(1)),

        datasets: [{
            data: dataArray.map(slice => slice[1]),
            borderColor: "#FFFFFF",
            borderWidth: 1,
            hoverOffset: 30
        }]
    };
    let tooltip = {
        yAlign: "bottom",
        bodyAlign: "center",
        titleAlign: "center",
        displayColors: false,
        bodyColor: "#d2e2e9",
        titleColor: "#FFFFFF",
        callbacks: {
            label: context => {
                let label = context.dataset.label || '';
                if (context.parsed !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                }
                return label;
            },

        }
    }
    let chartSkeleton = {
        type: 'pie',
        responsive: true,
        data: chartData,
        options: {

            layout: {
                padding: 10,
            },
            plugins: {
                colors: {
                    enabled: true,
                    forceOverride: true
                },
                title: {
                    color: "#FFFFFF",
                    display: true,
                    text: 'Monthly Budget Expenses',
                    font: ctx => {
                        var size = Math.round(ctx.chart.width / 20);
                        return {
                            weight: 'bold',
                            size: size
                        };
                    }
                }
                ,
                tooltip: tooltip,
                legend: {
                    display: ctx => {
                        return ctx.chart.width > 400 ? true : false;
                    },
                    labels: {
                        color: "#FFFFFF"
                    }
                }
            }
        }
    }
    const chart = buildChart("chart", chartSkeleton);
    document.getElementById("form1").addEventListener("change", () => { updateTable() })
    document.getElementById("form2").addEventListener("change", () => { updateTable(chart) })
});