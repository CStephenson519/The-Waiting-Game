var app = angular.module("myApp",["firebase"]);
app.controller("myCtrl", function($scope,  $firebaseAuth, $firebaseArray) {
   //$scope.point;
    $scope.providerName = null;
var getRef = function(){
        if($scope.ref == null){
            $scope.ref = new Firebase("https://amber-inferno-2604.firebaseio.com/points");
            $scope.ref.onAuth(function(authData) {
                if (authData) {
                    console.log("Authenticated with uid:", authData.uid);
                    $scope.auth = authData;

                    $scope.points = $firebaseArray($scope.ref);
             $scope.$apply();
                } else {
                    console.log("Client unauthenticated.")
                }
            });
        }
        return $scope.ref;
    }
$scope.auth = null;
$scope.ref = null;
getRef();

$scope.login =function() {

        var provider = 'google';
        var scope = {scope:'email'};
        var auth = $firebaseAuth(getRef());
        auth.$authWithOAuthPopup(provider, scope, function(error, authData){
            if (error) {
                // an error occurred while attempting login
                alert("error: " + error);
            }
        });
    };
    $scope.logout = function(){
        $scope.auth = null;
        getRef().unauth();
    }
    $scope.loginFb =function() {

        var provider = 'facebook';
        var scope = {scope:'email'};
        var auth = $firebaseAuth(getRef());
        auth.$authWithOAuthPopup(provider, scope, function(error, authData){
            if (error) {
                // an error occurred while attempting login
                alert("error: " + error);
            }
        });
    };

    $scope.addPoints = function() {

        var user = $scope.auth.uid;

        $scope.score = parseInt(document.getElementById('nca').innerHTML);
           console.log($scope.score);
        //update record
        var item = $scope.points.$getRecord(user);
        if(item != null)
        {
        var pts = parseInt(item.point) + $scope.score;
        item.point = pts;
        $scope.points.$save(item).then(function() {
      // data has been saved to our database
           });
        }
        else
        {
           var usersRef = $scope.ref.child(user);
           var index = user.indexOf(":");
           $scope.providerName = user.substring(0,index);
            if($scope.providerName == "google")
            {
               usersRef.set({
               user: $scope.auth.google.displayName,
               point:  $scope.score
               });
            }
            else
            {
                usersRef.set({
               user: $scope.auth.facebook.displayName,
               point:  $scope.score
               });
            }
        }
        document.getElementById("sbtn").disabled = true;
    };

    $scope.redeemPoints = function(){
        var user = $scope.auth.uid;
        var item = $scope.points.$getRecord(user);
        if( document.getElementById("discount10").checked || document.getElementById("discountDrink").checked || document.getElementById("discountApp").checked)
        {
            if(parseInt(item.point) >= 50)
            {
                if(document.getElementById("discount10").checked)
                {
                    var pts = parseInt(item.point) - 50;
                    $("#coupon").show();
                    document.getElementById("coupon").innerHTML = '<img src="coupons/img/ENTREE.jpg" width="100%" >';
                    document.getElementById("discount10").checked = false;
                }
                else if (document.getElementById("discountDrink").checked)
                {

                    var pts = parseInt(item.point) - 100;
                    $("#coupon").show();
                    document.getElementById("coupon").innerHTML = '<img src="coupons/img/FREE_DRINK.jpg" width="100%" >';
                    document.getElementById("discountDrink").checked = false;
                }
                else if(document.getElementById("discountApp").checked)
                {
                    var pts = parseInt(item.point) - 200;
                    $("#coupon").show();
                    document.getElementById("coupon").innerHTML = '<img src="coupons/img/FREE_APP.jpg" width="100%" >';
                    document.getElementById("discountApp").checked = false;
                }
                //$("#msg").show();
                //document.getElementById("msg").innerHTML = "Points redeemed from account";
                document.getElementById("displayPoint").innerHTML = "Points are " + pts;
            }
            else
            {       $("#coupon").hide();
                    $("#msg").show();
                    document.getElementById("msg").innerHTML = "Not enough money";
                document.getElementById("discount10").checked = false;
                document.getElementById("discountDrink").checked = false;
                document.getElementById("discountApp").checked = false;
            }
            if(pts > 0)
            {
                item.point = pts;
                $scope.points.$save(item).then(function() {
              // data has been saved to our database
                   });
            }
        }
    };

    $scope.displayPoints = function(){
          var user = $scope.auth.uid;
        var item = $scope.points.$getRecord(user);
        document.getElementById("displayPoint").innerHTML = "Points: "+ item.point;
        $("#msg").hide();
    };

});
