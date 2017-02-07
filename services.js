angular.module('app.services', []).
factory('protoData', function ($http) {


    function _getData() {
        return $.ajax({
            url: 'https://rayfissel.visualstudio.com/DefaultCollection/_apis/tfvc/items/$/Sentiment Analysis/data/proto_data_format.txt?api-version=2.0',
            headers: { Authorization: 'Basic cmF5bW9uZF9maXNzZWxAY29tcGFpZC5jb206YmZ4c2pxM2k0a2RydXB6Y3pqaTJ4eHN4dG4zdGZ6cmg1eWhubDdrNHhud29maWhyemVhYQ==' }
        });
    }

    return {
        getData: _getData
    }
});