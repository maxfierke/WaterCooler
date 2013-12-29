angular.module("ngToasts", []).directive("toast", ["$timeout", function ($timeout) {
	return {
	    replace: true,
	    templateUrl: "template/toast.html",
	    link: function (scope, element, attrs) {

	        var options = angular.extend({
	            timeout: 4000,
	            position: "top"
	        }, scope.$eval(attrs.toast));
	        var queue = [];

	        scope.alertClass = "alert-success";

	        (function init() {
	            $(element).css({
	                display: "none",
	                position: "fixed",
	                left: "50%",
	                zIndex: "2000"
	            });

	            if (options.position == "top") {
	                $(element).css({ top: "20px" });
	            }
	            else if (options.position == "bottom") {
	                $(element).css({ bottom: "10px" });
	            }
	        })();

	        function showToast(toastOptions) {
	            scope.alertClass = toastOptions.type || "alert-info";
	            scope.text = toastOptions.text;

	            $timeout(function () {
	                $(element).css({
	                    display: "block",
	                    marginLeft: -$(element).width() / 2,
	                });
	            });

	            $timeout(function () {

	                if (toastOptions.reload) {
	                    location.reload();
	                } else {
	                    $(element).fadeOut(function() {
	                        if (queue.length > 0) {
	                            showToast(queue.pop());
	                        }
	                    });
	                }
	            }, options.timeout);
	        };

	        scope.$on("toast", function (evt, toastOptions) {
	            if ($(element).is(":visible")) {
	                queue.push(toastOptions);
	            } else {
	                showToast(toastOptions);
	            }
	        });
	    }
	};
}])
.run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/toast.html",
		"\n" +
		"<div class='alert' ng-class='alertClass'>\n" +
		"  {{text}}\n" +
    	"</div>\n");
}]);