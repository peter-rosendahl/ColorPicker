# Color Picker Plugin for Umbraco


This is a simple plugin, where you can pull sliders to get the color, you desire.




## Features


* Get any color from the RGBA scale
* Use the color anywhere
* Option to store a color list to use in the TinyMCE content editor




## Setup


1. Take the ColorLibraryApiController.cs file and place it in the APP_Code folder on your Umbraco project
2. Take the rest of the files and place them in a new folder in APP_Plugins folder called "SingleColorPicker"
3. Look through and rename all references to PRmedia, so that it is called by your project name
4. Add the methods below in a Controller, that you use for general purposes

```C#
protected string GetSingleColor(IPublishedContent currentNode, string alias)
{
    IList jsonList = GetDeserializedObjectFromProperty(currentNode, alias);
    if (jsonList == null)
    {
        return string.Empty;
    }

    foreach (var element in jsonList)
    {
        var details = JsonConvert.DeserializeObject<Dictionary<string, double>>(element.ToString());

        double red = 0,
            green = 0,
            blue = 0,
            alpha = 0;
        var redBool = details.TryGetValue("red", out red);
        var greenBool = details.TryGetValue("green", out green);
        var blueBool = details.TryGetValue("blue", out blue);
        var alphaBool = details.TryGetValue("alpha", out alpha);
        string alphaNew = alpha.ToString().Replace(",", ".");

        return $"rgba({red},{green},{blue},{alphaNew})";
    }

    return string.Empty;
}

protected IList GetDeserializedObjectFromProperty(IPublishedContent currentNode, string propertyAlias)
{
    var propertyValue = currentNode.GetPropertyValue(propertyAlias);
    if (propertyValue != null)
    {
        string schemeRawValue = propertyValue.ToString();
        try
        {
            if (schemeRawValue.DetectIsJson())
            {
                IList thisList = JsonConvert.DeserializeObject<IList>(schemeRawValue);
                return thisList;
            }
        }
        catch (Exception e)
        {

        }
    }
    return null;
}
```

5. Add the following tag in the file config/tinyMceConfig.config:

```xml
<config key="textcolor_map">["000000","Black","993300","Burnt orange","333300","Dark olive","246aa3","Baby blue","dbae84","Gold","ffc6e6","Army Green","ff8f47","Orange","ffffff","Hvid"]</config>
```

6. Login to Umbraco control panel, go to Developer -> Datatypes, and create a new datatype with the new plugin - it should be visible with the name PRmedia.SingleColorPicker or similar.

**Enjoy**