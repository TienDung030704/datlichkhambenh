document.addEventListener("DOMContentLoaded", function () {

const days = document.querySelectorAll(".day-btn")

days.forEach(btn => {

btn.addEventListener("click", function(){

const day = this.innerText

localStorage.setItem("selectedDay", day)

window.location.href="select-doctor.html"

})

})

})