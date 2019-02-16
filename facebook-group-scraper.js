// ==UserScript==
// @name         Facebook Group Scraper
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Grab facebook search terms and send to server
// @author       madreloidpx
// @match        https://www.facebook.com/groups/*/for_sale_search/*
// @grant        none
// ==/UserScript==

let result_image = null; //link of the mall post image
let post_link = null; //link of the mall post itself
let title = null; //title of the mall post
let price = null; //price of the item sold
let location = null; //location where the item is sold
let description = null; //seller's description of the item
var php_url = "test.php"; //php link

setInterval(function(){ //scroll through the search results
    window.scrollTo(0,document.body.scrollHeight);
}, 100);
setInterval(function(){ //scroll back to the top and reload page after 5min
    window.scrollTo(0,document.body.scrollTop);
    //sendData(); //commented it out since there is no actual php script as of the moment
    window.location.reload();
}, 300000);

function sendData(){
    var data = [result_image, post_link, title, price, location, description];
    var httpc = new XMLHttpRequest();
    httpc.open("POST", php_url, true);
    httpc.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpc.onreadystatechange = function() {
        if(httpc.readyState == 4 && httpc.status == 200) {
            alert(httpc.responseText);
        }
    };
    httpc.send(data);
}

function MutationObserverCallback(mutations){ //checks for changes in the DOM
    console.log('Enter!');
    for(let mutation of mutations){
        const mall_post = [].slice.call(mutation.target.querySelectorAll('div[id*=mall_post]'));
        searchResults(mall_post);
    }
}

function searchResults(mall_post){ //scrapes the data
    result_image = mall_post.map(function(mall_post) {
        var image_link = mall_post.querySelector('img[class*=scaledImageFitHeight]');
        if(image_link != null){
            return image_link.getAttribute('src');
        }else{
            return image_link;
        }
    });
    post_link = mall_post.map(function(mall_post){
        return 'https://facebook.com' + mall_post.querySelector('a[href*=sale_post]').getAttribute('href');
    });
    title = mall_post.map(function(mall_post){
        return mall_post.querySelector('span[class*=_9zp]').innerText;
    });
    price = mall_post.map(function(mall_post){
        return mall_post.querySelector('div[class*=_sz6]').innerText;
    });
    location = mall_post.map(function(mall_post){
        var loc = mall_post.querySelector('div[class*=_2gqu]');
        if(loc != null){
            return loc.innerText;
        }else{
            return loc;
        }
    });
    description = mall_post.map(function(mall_post){
        var desc = mall_post.querySelector('div[class*=_5rfl]');
        if(desc != null){
            return desc.innerText;
        }else{
            return desc;
        }
    });
    console.log(result_image);
    console.log(post_link);
    console.log(title);
    console.log(price);
    console.log(location);
    console.log(description);
}

window.addEventListener('load', function() { //gets the feed after reloading and creating an observer to check for changes
    const targetNode = document.querySelector('[role*=feed]');
    const mall_post = [].slice.call(targetNode.querySelectorAll('div[id*=mall_post]'));
    searchResults(mall_post);
    const config = { childList: true };
    const observer = new MutationObserver(MutationObserverCallback);
    observer.observe(targetNode, config);
});
