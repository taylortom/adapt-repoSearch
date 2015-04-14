$(function(){
    var loaded = 0;
    var totalResults = -1;
    var items = [];
    var done = false;

    var PER_PAGE = 100;
    var RESULTS_API_LIMIT = 1000;
    var SEARCH_QUERY = "q=adapt-+language:javascript+in:name";
    var REPO_PREFIX = "adapt";
    var NAME_BLACKLIST = [
        "adapter",
        "adaptor",
        "adaptr",
        "adaptive"
    ];

    startDataLoad();

    function startDataLoad() {
        var baseURL = "https://api.github.com/search/repositories?" + SEARCH_QUERY + "&per_page=" + PER_PAGE + "&page=";
        $.get(baseURL + 1, {}, function(data) {
            if(data.total_count > RESULTS_API_LIMIT) {
                alert("Warning: only the first " + RESULTS_API_LIMIT + " results are available (search returned " + data.total_count + ")");
                totalResults = RESULTS_API_LIMIT;
            }
            else totalResults = data.total_count;

            dataLoaded(data);

            console.log(totalResults + ' found, grabbing and filtering...');

            // start loading the rest
            for(var i = 2, pages = Math.ceil(totalResults/PER_PAGE); i <= pages; i++) {
                $.get(baseURL + i, {}, dataLoaded);
            }
        });
    }

    function dataLoaded(data) {
        if(data.items) {
            loaded += data.items.length;
            items = items.concat(data.items);
        }
        if(loaded === totalResults) sortData();
    }

    function sortData() {
        var spliced = [];
        for(var i = 0, len = items.length; i < len; i++) {
            if(!isNameBlacklisted(items[i].name)) spliced.push(items[i]);
        }
        render(spliced);
    }

    function isNameBlacklisted(pName) {
        if(pName.toLowerCase().indexOf(REPO_PREFIX) === -1) return true;

        for(var i = 0, len = NAME_BLACKLIST.length; i < len; i++) {
            if(pName.toLowerCase().indexOf(NAME_BLACKLIST[i]) !== -1) return true;
        }
    }

    function render(pItems) {
        var templateData = Handlebars.compile($(".template").html());
        $(".template").remove();

        var html = templateData(pItems);
        $(".container").html(html);
    }

    function getSearchString() {
        var page = (loaded/PER_PAGE)+1;
        return "https://api.github.com/search/repositories?" + SEARCH_QUERY + "&per_page=" + PER_PAGE + "&page=" + page;
    }
});
