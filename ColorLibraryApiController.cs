using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using System.Web.Mvc;
using Umbraco.Web.WebApi;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

// Put this controller class in APP_Code folder and change "PRmedia" to be your project namespace
namespace PRmedia.App_Code
{
    // Switch "PRmedia" with your Umbraco project name
    [Umbraco.Web.Mvc.PluginController("PRmedia")]
    public class ColorLibraryApiController : UmbracoAuthorizedApiController
    {
        public class Color
        {
            public string HexCode { get; set; }
            public string Name { get; set; }
        }

        [HttpGet]
        public IEnumerable<Color> getColorList()
        {
            List<Color> itemList = new List<Color>();
            string path = HttpContext.Current.Server.MapPath("~/config/TinyMceConfig.config");
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }
            try
            {
                XDocument doc = XDocument.Load(path);

                XNode lastNode = doc.LastNode;
                IEnumerable<XElement> colorJson = 
                    from el in doc.Descendants("config")
                    where (string) el.Attribute("key") == "textcolor_map"
                    select el;
                
                XElement listItem = colorJson.FirstOrDefault();
                if (listItem == null)
                {
                    return null;
                }

                List<string> valueList = JsonConvert.DeserializeObject<List<string>>(listItem.Value);

                // Because the array has value order as 'ColorCode','ColorName', etc. - loop only through index 1, 3, 5, Etc. hereafter add name from next index
                for (int i = 0; i < valueList.Count; i+=2)
                {
                    var color = valueList[i];
                    if (!string.IsNullOrEmpty(color))
                    {
                        Color hexColor = new Color();
                        hexColor.HexCode = "#" + color;
                        hexColor.Name = valueList[i + 1];
                        itemList.Add(hexColor);
                    }
                }                
            }
            catch (Exception e)
            {

                throw;
            }
                

            return itemList;
        }

        [HttpPost]
        public void PostNewColor(Color color)
        {
            string path = HttpContext.Current.Server.MapPath("~/config/TinyMceConfig.config");
            if (string.IsNullOrEmpty(path) && string.IsNullOrEmpty(color.HexCode))
            {
                return;
            }

            try
            {
                XDocument doc = XDocument.Load(path);

                XNode lastNode = doc.LastNode;
                IEnumerable<XElement> colorJson =
                    from el in doc.Descendants("config")
                    where (string)el.Attribute("key") == "textcolor_map"
                    select el;

                XElement colorMap = colorJson.FirstOrDefault();

                if (colorMap == null)
                {
                    return;
                }

                List<string> colors = JsonConvert.DeserializeObject<List<string>>(colorMap.Value);

                colors.Add(color.HexCode.Substring(1));
                colors.Add(color.Name);

                colorMap.SetValue(JsonConvert.SerializeObject(colors));
                doc.Save(path);
            }
            catch (Exception e)
            {

            }

            return;
        }
    }
}