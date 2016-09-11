var getNews = function (company) {
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    $nytElem.text("");

    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + company + '&sort=newest&api-key=c2e884fe2a014ed4a5d4eea086b34180';
    $.getJSON(nytimesUrl, function(data){
        console.log("AJAX return for NY Times News", data)

        $nytHeaderElem.text('Media Articles About Your Portfolio');
        articles = data.response.docs;
        for(var i = 0; i < 2; i++)
        {
            var article = articles[i];
            $nytElem.append('<li class="article">' + '<a href="' + article.web_url +'">' + article.headline.main + '</a><a>' + ' -- ' + article.pub_date + '</a>' + '<p>' + article.snippet + '</p>' + '</li>');
        };
    }).error(function(e){
        $nytElem.text('New York Times Articles Could Not Be Loaded');
    });
}

window.onload = function(){
    getNews("AAPL");
    getNews("YELP");
    getNews("GOOG");
    getNews("YHOO");

}