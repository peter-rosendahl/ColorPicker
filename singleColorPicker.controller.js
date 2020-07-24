angular.module("umbraco")
    .controller("PRmedia.SingleColorPicker", function ($scope, $element, colorLibraryResource) {

        $scope.listedColors = [];
        var showButton = $scope.model.config.showAddToLibraryButton;
        if (showButton != 1)
        {
            $($element).find(".colorList").hide();
            $($element).find(".addToLibrary").hide();
            $($element).find(".colorName").hide();
        }
        else
        {
            $($element).find(".colorList").show();
            $($element).find(".addToLibrary").show();
            $($element).find(".colorName").show();
            $scope.listedColors = ["#00FF00"];
            updateColorList();
        }

        $($element).find("div[class*='Slider']").slider({ orientation: "horizontal", range: "min", max: 255 });
        $($element).find(".alphaSlider").slider({ orientation: "horizontal", range: "min", max: 1, min: 0, step: 0.01 });

        var sliderRed = $($element).find(".redSlider"),
            valueRed = $($element).find(".redValue"),
            sliderGreen = $($element).find(".greenSlider"),
            valueGreen = $($element).find(".greenValue"),
            sliderBlue = $($element).find(".blueSlider"),
            valueBlue = $($element).find(".blueValue"),
            sliderAlpha = $($element).find(".alphaSlider"),
            valueAlpha = $($element).find(".alphaValue"),
            valueHex = $($element).find(".hexValue"),
            colorBox = $($element).find(".colorBox"),
            textPreview = $($element).find(".colorTextPreview");
        
        // Set color values from database or default
        if (angular.isArray($scope.model.value))
        {
            var scheme = $scope.model.value[0];

            $(sliderRed).slider({ value: scheme.red, slide: refreshSwatch, change: refreshSwatch });
            $(sliderGreen).slider({ value: scheme.green, slide: refreshSwatch, change: refreshSwatch });
            $(sliderBlue).slider({ value: scheme.blue, slide: refreshSwatch, change: refreshSwatch });
            $(sliderAlpha).slider({ value: scheme.alpha, slide: refreshSwatch, change: refreshSwatch });
            $(colorBox).css("background", "rgba(" + scheme.red + ", " + scheme.green + "," + scheme.blue + "," + scheme.alpha + ")");

            $(valueRed).val(scheme.red);
            $(valueGreen).val(scheme.green);
            $(valueBlue).val(scheme.blue);
            $(valueAlpha).val(scheme.alpha);
            var firstHexColor = getHexCode(scheme.red, scheme.green, scheme.blue);
            $(valueHex).val(firstHexColor);

            $(textPreview).css("color", firstHexColor);
        }
        else
        {
            $(sliderRed).slider({ value: 255, slide: refreshSwatch, change: refreshSwatch });
            $(sliderGreen).slider({ value: 255, slide: refreshSwatch, change: refreshSwatch });
            $(sliderBlue).slider({ value: 255, slide: refreshSwatch, change: refreshSwatch });
            $(sliderAlpha).slider({ value: 1, slide: refreshSwatch, change: refreshSwatch });
            $(colorBox).css("background", "rgba(255,255,255,1)");
            $(textPreview).css("color", "#000000");

            $(valueRed).val(255);
            $(valueGreen).val(255);
            $(valueBlue).val(255);
            $(valueAlpha).val(1);
        }

        // Slider event handler => change values
        $($element).find(".colorBar input").on("change paste", function (e)
        {
            var value = this.value;
            var percentValue = (this.value / this.max * 100);
            var parentBox = e.currentTarget.parentElement;
            $(parentBox).find("div[class*='Slider']").slider({ value: this.value });
        });

        // HEX color input event handler => change values
        $($element).find(".hexColorBar input").on("change paste", function (e)
        {
            //console.log(e);
            var value = this.value;
            var isOk = /(^#[0-9A-F]{6}$)/i.test(value);
            if (isOk) {
                var newValue = hexToRgb(value);
                //console.log(newValue);
                var parentBox = e.currentTarget.parentElement.parentElement;
                //console.log(parentBox);
                $(sliderRed).slider({ value: newValue.r });
                $(sliderGreen).slider({ value: newValue.g });
                $(sliderBlue).slider({ value: newValue.b });
                $(this).css("border-color", "#bbbabf");
            }
            else if (!$(this).val() ) {
                $(this).css("border-color", "#bbbabf");
            }
            else {
                $(this).css("border-color", "red");
            }
        });


        $scope.addColorToLibrary = function ()
        {
            var newColor = $(valueHex).val();

            var nameBox = $($element).find(".colorName");
            if (!$(nameBox).val()) {
                $(nameBox).css("border-color", "red");
            }
            else {
                $(nameBox).css("border-color", "#bbbabf");
                var name = $(nameBox).val();
                colorLibraryResource.saveNewColor(newColor, name).then(function (response) {
                    updateColorList();
                });
                $(nameBox).val("");
            }
        }

        // Library click events => update value
        $scope.setColorValue = function (color)
        {
            var hexCode = color;
            var rgbCode = hexToRgb(hexCode);
            //$(valueHex).val(hexCode);
            $(sliderRed).slider({ value: rgbCode.r });
            $(sliderGreen).slider({ value: rgbCode.g });
            $(sliderBlue).slider({ value: rgbCode.b });
        }

        function updateColorList()
        {
            colorLibraryResource.getColorList().then(function (response) {
                var existingColorsView = $($element).find(".existingColors");
                //$(existingColorsView).empty();
                $scope.listedColors = [];
                $.each(response, function (key, value) {
                    var color = {
                        HexCode: value.HexCode,
                        Name: value.Name
                    }
                    $scope.listedColors.push(color);
                    //$(existingColorsView).append("<div class='color' style='background: " + value.HexCode + ";'></div>");
                });
                
            });
        }
        
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function rgbToHex(rgb) {
            var hex = Number(rgb).toString(16);
            if (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }

        function getHexCode(red, green, blue) {
            var hexRed = rgbToHex(red),
                hexGreen = rgbToHex(green),
                hexBlue = rgbToHex(blue);

            return "#" + hexRed + hexGreen + hexBlue;
        }

        function refreshSwatch() {
            var redOne = $(sliderRed).slider("value"),
                greenOne = $(sliderGreen).slider("value"),
                blueOne = $(sliderBlue).slider("value"),
                alphaOne = $(sliderAlpha).slider("value");

            var firstHexCode = "#" + rgbToHex(redOne) + rgbToHex(greenOne) + rgbToHex(blueOne);
            $(valueHex).val(firstHexCode);

            $(valueRed).val(redOne);
            $(valueGreen).val(greenOne);
            $(valueBlue).val(blueOne);
            $(valueAlpha).val(alphaOne);

            $(colorBox).css("background", "rgba(" + redOne + ", " + greenOne + "," + blueOne + "," + alphaOne + ")");
            //$scope.model.value = "linear-gradient(rgba(" + redOne + ", " + greenOne + "," + blueOne + ",1), rgba(" + redTwo + ", " + greenTwo + ", " + blueTwo + ", 1))";
            //$scope.model.value = [redOne,greenOne,blueOne,alphaOne,redTwo,greenTwo,blueTwo,alphaTwo,degrees];

            $scope.model.value = '[{ "red": ' + redOne + ', ' +
                '"green": ' + greenOne + ',' +
                '"blue": ' + blueOne + ',' +
                '"alpha": ' + alphaOne + '}]';

            //$($element).find(".colorCode").val("rgba(" + redOne + ", " + greenOne + "," + blueOne + "," + alphaOne + ")");
            $(textPreview).css("color", "rgba(" + redOne + ", " + greenOne + "," + blueOne + "," + alphaOne + ")");
        }

    });
