setInterval(setClock, 1000);

    const t = document.querySelector(".time");
    const d = document.querySelector(".date");
    const currentDate = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    d.innerText = currentDate.toLocaleDateString("en-US",options);

    function setClock(){
        const currentTime = new Date();
        let seconds = "0" + currentTime.getSeconds();
        seconds = seconds.slice(-2);
        let minutes = "0" + currentTime.getMinutes();
        minutes = minutes.slice(-2);
        let hours = "0" + currentTime.getHours();
        hours = hours.slice(-2);
        const tt = hours + " : " + minutes + " : " + seconds;
        t.innerText = tt;
    }
    setClock();

    window.addEventListener('load', () => {
        let lon;
        let lat;
        const t = document.querySelector(".temp");
        const d = document.querySelector(".desc");
        const i = document.querySelector(".weatherIcon");
    
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(position => {
                lon = position.coords.longitude;
                lat = position.coords.latitude;
                const apiKey = "Your API Key";
                const units = "metric";
                const url = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid="+apiKey+"&units="+units;
    
                fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const temp = data.main.temp;
                    const desc = data.weather[0].description;
                    const icon = data.weather[0].icon;
                    let iconURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png";
    
                    t.innerText = temp + "℃";
                    d.innerText = desc;
                    i.src = iconURL;
                });
            });
        }
    
        else{
            alert("Please enable geolocation in the browser.");
        }
    });

    let darkBtn = document.querySelector(".dark-mode");
    let cards = document.querySelectorAll(".news-card");
    let items = document.querySelectorAll(".item");
    let headings = document.querySelectorAll(".heading");
    let link = document.createElement('link'); 
    link.rel = 'stylesheet';   
    link.type = 'text/css';

    darkBtn.addEventListener("click", function(){
        if(darkBtn.style.color != "black"){
            document.body.classList.add("darkTheme");
            document.querySelector(".info").style.color = "black";
            darkBtn.style.backgroundColor = "rgb(33, 195, 277)";
            darkBtn.style.color = "black";
            darkBtn.innerHTML = 'Day Mode <i class="fa fa-sun-o" aria-hidden="true"></i>';
            cards.forEach(function(card){
                card.style.backgroundColor = "#606060";
                card.style.color = "black";
            });
            items.forEach(function(item){
                item.style.backgroundColor = "#606060";
                item.style.color = "black";
            });
            link.href = 'http://code.jquery.com/ui/1.9.1/themes/ui-darkness/jquery-ui.css';
            document.head.appendChild(link);
            document.querySelector(".calendar").style.backgroundColor = "#606060";
            headings.forEach(function(heading){
                heading.style.backgroundColor = "#ffb432";
            });
        }
        else{
            document.body.classList.remove("darkTheme");
            document.querySelector(".info").style.color = "#212529";
            darkBtn.style.backgroundColor = "#343a40";
            darkBtn.style.color = "white";
            darkBtn.innerHTML = 'Dark Mode <i class="fa fa-moon-o" aria-hidden="true"></i>';
            cards.forEach(function(card){
                card.style.backgroundColor = "white";
                card.style.color = "#212529";
            });
            items.forEach(function(item){
                item.style.backgroundColor = "white";
                item.style.color = "#212529";
            });
            document.head.removeChild(document.head.lastChild);
            document.querySelector(".calendar").style.backgroundColor = "white";
            headings.forEach(function(heading){
                heading.style.backgroundColor = "#ff6d37";
            });
        }
    });

    $( function(){
        $(".calendar").datepicker({
            showOtherMonths:true,
            minDate: new Date(2020,0,1),
            maxDate: new Date(2022,11,31)
        });
    });

    $(".mt").keyup(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            $(".memo").submit();
        }
    });