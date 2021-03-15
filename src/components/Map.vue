<template>
  <v-container fluid>
    <portal to="allStationButton">
      <v-btn text v-if="!showAnimationControl" @click="setStandartStyle">
        <v-icon left>mdi-filter-remove</v-icon>Показать все станции
      </v-btn>
    </portal>
    <portal to="levelByButton">
      <v-btn text v-if="!showAnimationControl" @click="setLimitStyle">
        <v-icon left>mdi-flash-alert</v-icon>НЯ и ОЯ за последний срок
      </v-btn>
    </portal>
    <portal to="dynamicButton">
      <v-btn text @click="toggleAnimationControl">
        <v-icon left>mdi-timelapse</v-icon>Динамика
      </v-btn>
    </portal>
    <v-row justify="center">
      <v-dialog
        style="z-index:100000000"
        v-model="dialog"
        width="90%"
        light
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <!-- <v-card> -->
        <highcharts ref="highcharts" :options="chartOptions"></highcharts>
        <!-- </v-card> -->
      </v-dialog>
      <v-container fluid style="height:86vh;">
        <l-map :center="[59,59]" :zoom="6">
          <l-control position="bottomright" v-if="showAnimationControl">
            <v-card max-width="280" outlined>
              <v-card-title>Информация о анимации</v-card-title>
              <v-card-text>
                Cтанции, где уровень не превысил НЯ, помечены желтым цветом. Чем больше круг тем ближе значения уровня воды на выбранную дату к уровню НЯ.
                <br />Станции, где уровень превысил НЯ, показаны красным. Чем больше круг, тем дальше отметка уровня воды от уровня НЯ
              </v-card-text>
            </v-card>
          </l-control>
          <l-control position="topright">
            <v-container fluid>
              <!-- <v-row v-if="!showAnimationControl">
                <v-col>
                  <v-btn @click="setStandartStyle">Показать все станции</v-btn>
                </v-col>
              </v-row>

              <v-row v-if="!showAnimationControl">
                <v-col>
                  <v-btn @click="setLimitStyle">НЯ и ОЯ за последний срок</v-btn>
                </v-col>
              </v-row>
              <v-row v-if="!showAnimationControl">
                <v-col>
                  <v-btn @click="toggleAnimationControl">Динамика</v-btn>
                </v-col>
              </v-row>-->
              <v-row v-if="showAnimationControl" align="stretch" justify="end">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn icon @click="toggleAnimationControl()" v-on="on">
                      <v-icon :size="25">mdi-close</v-icon>
                    </v-btn>
                  </template>
                  <span>Закрыть анимацию</span>
                </v-tooltip>
              </v-row>
              <v-row v-if="showAnimationControl" no-gutters align="baseline" justify="end">
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="prevDate()"
                        v-on="on"
                        :disabled="isAnimation||selectedDateIndex===0"
                      >
                        <v-icon :size="25">mdi-skip-previous-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Предыдущая дата</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="5" style="z-index:1000;">
                  <v-select solo :items="dates" v-model="selectedDate" :disabled="isAnimation"></v-select>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="nextDate()"
                        v-on="on"
                        :disabled="isAnimation||selectedDateIndex===timeIntervals.length-1"
                      >
                        <v-icon class="group pa-2" :size="25">mdi-skip-next-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Следующая дата</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn icon @click="startAnimation()" v-on="on" :disabled="isAnimation">
                        <v-icon>mdi-play-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Запустить анимацию</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn @click="stopAnimation()" icon v-on="on" :disabled="!isAnimation">
                        <v-icon>mdi-stop-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Остановить анимацию</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-container>
          </l-control>
          <!-- <b-form-group label="Individual radios">
            <b-form-radio-group size="sm">
            <template v-for="date in aviableDates">
              <b-form-radio size="sm" :key="date" :value="date"></b-form-radio>
            </template>
            </b-form-radio-group>
          </b-form-group>-->

          <!-- <v-btn text right absolute @click="requestRow" style="z-index:100000000;">Test request</v-btn> -->

          <!-- Анимация -->

          <!-- control when not full display -->

          <!-- Анимация -->

          <l-tile-layer :url="url"></l-tile-layer>
          <l-geo-json ref="geoJson" :geojson="gydroPostsLocations" :options="optionsGeoJSON"></l-geo-json>
        </l-map>
      </v-container>
      
    </v-row>
  </v-container>
</template>

<script>
import L from "leaflet";
import { LMap, LTileLayer, LGeoJson, LControl } from "vue2-leaflet";
import { hydroPosts } from "../assets/gydroPostsLocation";
//const  hydroPosts = hydroPosts
import { Icon } from "leaflet";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export default {
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      gydroPostsLocations: hydroPosts,
      testLink:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSExk-xC5mNfpyh_Ul5iyXkftuMdcgsLHEqCpyvCaEhUFlDXQaX6aqv_uCclYBO_g/pub?gid=1875061110&single=true&output=csv",
      CSVData: [],
      dialog: false,
      selectedNum: null,
      setStyle: false,
      recalcToRed: false,
      zeroData: false,
      showAnimationControl: false,
      selectedDate: null,
      isAnimation: false,
      timer: "",
      request: null
    };
    //https://sheets.googleapis.com/v4/spreadsheets/1y_fN6NlTw_XVpEK4mlt-EUD5koA1JsNk/values/Уровни воды 107 ВВП!A1:D5
  },
  computed: {
    chartOptions() {
      return {
        lang: {
          noData: "Nichts zu anzeigen"
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030"
          }
        },
        legend: {
          enabled: false
        },
        title: {
          text: this.clickedData.title
        },
        series: [
          {
            name: "Уровень воды, см",
            data: this.clickedData.data
          }
        ],
        yAxis: [
          {
            max: this.clickedData.maxValue,
            title: {
              text: "Уровень воды, см"
            },
            // ymax: this.clickedData.redLimit + 50,
            plotLines: [
              {
                color: "blue", // Color value
                //dashStyle: "longdashdot", // Style of the plot line. Default to solid
                value: this.clickedData.yellowLimit, // Value of where the line will appear
                width: 2, // Width of the line,
                dashStyle: "shortdash",
                label: {
                  align: "right",
                  text: `НЯ от "0" графика поста,  ${this.clickedData.yellowLimit} см`
                },
                zIndex: 1.5
              },
              {
                color: "red", // Color value
                //dashStyle: "longdashdot", // Style of the plot line. Default to solid
                value: this.clickedData.redLimit, // Value of where the line will appear
                width: 2,
                dashStyle: "shortdash",
                label: {
                  text: `ОЯ от "0" графика поста, ${this.clickedData.redLimit} см`
                },
                zIndex: 1.5 // Width of the line
              }
            ]
          }
        ],
        xAxis: [
          {
            categories: this.timeIntervals,
            labels: {
              enabled: false
            },
            title: {
              text: "Сроки измерения"
            }
          }
        ]
      };
    },
    timeIntervals() {
      let startDate = new Date(2020, 3, 17);
      let endDate = new Date(2020, 4, 30);

      let dateArray = new Array();
      let currentDate = startDate;
      while (currentDate <= endDate) {
        dateArray.push(
          new Date(currentDate).toLocaleDateString("ru") + " 08:00"
        );
        dateArray.push(
          new Date(currentDate).toLocaleDateString("ru") + " 18:00"
        );
        currentDate = currentDate.addDays(1);
      }
      return dateArray;
    },
    dates() {
      // dates in format {
      //  value:
      //  text:
      //}
      return this.timeIntervals.map(date => {
        return { text: date, value: date };
      });
    },
    selectedDateIndex() {
      return this.timeIntervals.indexOf(this.selectedDate);
    },
    clickedData() {
      if (this.CSVData && this.selectedNum) {
        // measures of water level
        // first 7 unnecessary cols in google spreed table
        const graphValues = this.CSVData.filter(
          row => row[0] == this.selectedNum
        )[0]
          .slice(7)
          .map(value => parseFloat(value));

        const yellowLimitValue = parseFloat(
          this.CSVData.filter(row => row[0] == this.selectedNum)[0][4]
        );
        const redLimitValue = parseFloat(
          this.CSVData.filter(row => row[0] == this.selectedNum)[0][5]
        );
        // set limit lines

        const nonNanArray = graphValues.filter(value => !Number.isNaN(value));
        const maxValue = Math.max(...nonNanArray);

        // set that data is zeros
        // this.zeroData = maxValue === 0.0 ? true : false;

        const maxObservedValue =
          maxValue > redLimitValue ? maxValue + 100 : redLimitValue;

        return {
          data: graphValues,
          title: `Номер в списке: ${
            this.CSVData.filter(row => row[0] == this.selectedNum)[0][0]
          }, Название: ${
            this.CSVData.filter(row => row[0] == this.selectedNum)[0][2]
          }`,
          yellowLimit: yellowLimitValue,
          redLimit: redLimitValue,
          maxValue: maxObservedValue
        };
      } else {
        return {
          data: [],
          title: "",
          yellowLimit: 0,
          redLImit: 0,
          maxValue: 0
        };
      }
    },
    optionsGeoJSON() {
      return {
        pointToLayer: this.pointToLayer,
        onEachFeature: this.onEachFeature
      };
    },
    pointToLayer() {
      // console.log(isEmpty(this.countEvetns) ? 5 : 10)
      return (feature, latlng) => {
        // console.log(feature)
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      };
    },
    onEachFeature() {
      return (feature, layer) => {
        const tooltipContent =
          "<div>" +
          `Номер в списке : <b>${feature.properties.N}</b>` +
          "<div>" +
          "<div>" +
          `Район : ${feature.properties.District}` +
          "<div>" +
          "<div>" +
          `Река : ${feature.properties.stream}` +
          "<div>" +
          "<div>" +
          `Населенный пункт : ${feature.properties.Settlement}` +
          "<div>";
        layer.bindTooltip(tooltipContent);
        layer.on({
          click: e => {
            this.selectedNum = e.target.feature.properties.N;
            this.dialog = true;
            // layer.openPopup("Hi!");
            // e.layer.setStyle({
            //   weight: 5
            // })
          }
        });
      };
    }
  },
  methods: {
    stopAnimation() {
      clearInterval(this.timer);
      this.isAnimation = false;
      // cancelAnimationFrame(this.request)
    },
    startAnimation() {
      this.isAnimation = true;
      //this.request = requestAnimationFrame(this.animation)
      let index = this.selectedDateIndex;
      this.timer = setInterval(() => {
        if (index < this.timeIntervals.length) {
          this.selectedDate = this.timeIntervals[index];
          index += 1;
        }
      }, 500);
      // let index = this.selectedDateIndex;
    },
    nextDate() {
      this.selectedDate = this.timeIntervals[this.selectedDateIndex + 1];
    },
    prevDate() {
      this.selectedDate = this.timeIntervals[this.selectedDateIndex - 1];
    },
    toggleAnimationControl() {
      if (this.showAnimationControl) this.setStandartStyle(); // set default style
      this.showAnimationControl = this.showAnimationControl ? false : true;
      this.selectedDate = this.selectedDate ? null : this.timeIntervals[0];
    },
    async requestTableData() {
      // const request = await fetch(
      //   `https://docs.google.com/spreadsheets/d/e/2PACX-1vSExk-xC5mNfpyh_Ul5iyXkftuMdcgsLHEqCpyvCaEhUFlDXQaX6aqv_uCclYBO_g/pub?gid=1875061110&single=true&output=csv`
      // );

      //local 
      //console.log(`${process.env.BASE_URL}data/data.csv`)
      const request = await fetch(
        `${process.env.BASE_URL}data/data.csv`
      );
      const data = await request.text();
      // delete headers rows
      this.CSVData = this.CSVToArray(data).slice(4);
      // thisCSVDATA = this.CSVToArray(data)
      //return data;
    },
    CSVToArray(strData, strDelimiter) {
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = strDelimiter || ",";

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        // Delimiters.
        "(\\" +
          strDelimiter +
          "|\\r?\\n|\\r|^)" +
          // Quoted fields.
          '(?:"([^"]*(?:""[^"]*)*)"|' +
          // Standard fields.
          '([^"\\' +
          strDelimiter +
          "\\r\\n]*))",
        "gi"
      );

      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;

      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while ((arrMatches = objPattern.exec(strData))) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
          strMatchedDelimiter.length &&
          strMatchedDelimiter !== strDelimiter
        ) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
        } else {
          // We found a non-quoted value.
          strMatchedValue = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }

      // Return the parsed data.
      return arrData;
    },
    setLimitStyle() {
      // middle (yellow level of danger)
      // 4 column  index of this value 4
      // red (red level of danger)
      // 5 column  index of this value 5
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            let stationData = this.CSVData.filter(
              row => parseInt(row[0]) === layer.feature.properties.N
            )[0];

            //console.log(layer.feature.properties.N)
            const datesValues = stationData.slice(7);
            let yellowLimit = parseFloat(stationData[4]);
            let redLimit = parseFloat(stationData[5]);
            // get last non empty value
            let lastNonZeroValue = parseFloat(
              datesValues[datesValues.indexOf("") - 1]
            );
            const nonNanArray = datesValues.filter(
              value => !Number.isNaN(value)
            );
            const maxValue = Math.max(...nonNanArray);
            let style;
            // if between yellow and red return yellow
            // if above red return red
            // default "#ff7800"
            if (
              lastNonZeroValue >= yellowLimit &&
              lastNonZeroValue < redLimit
            ) {
              style = {
                radius: 7,
                fillColor: "yellow",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              };
            } else if (lastNonZeroValue >= redLimit && redLimit != 0.0) {
              // color = "red";
              style = {
                radius: 10,
                fillColor: "red",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              };
            } else if (maxValue == 0.0) {
              style = {
                radius: 0.01,
                fillColor: "#ff7800",
                color: "#000",
                weight: 0,
                opacity: 0.01,
                fillOpacity: 0.01
              };
            } else {
              // color = "#ff7800";
              style = {
                radius: 0.01,
                fillColor: "#ff7800",
                color: "#000",
                weight: 0,
                opacity: 0.01,
                fillOpacity: 0.01
              };
            }
            layer.setStyle(style);
          });
        }
      });
    },
    setValueStyle() {
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            layer.setStyle({
              radius:
                parseInt(
                  this.CSVData.filter(
                    row => parseInt(row[0]) === layer.feature.properties.N
                  )[0][5]
                ) / 100
            });
          });
        }
      });
    },
    setStandartStyle() {
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            layer.setStyle({
              radius: 5,
              fillColor: "#ff7800",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            });
          });
        }
      });
    }
  },
  watch: {
    selectedDate: function() {
      console.log("date change");
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            // define radius
            const stationData = this.CSVData.filter(
              row => parseInt(row[0]) === layer.feature.properties.N
            )[0];
            // console.log(layer.feature.properties.N)
            const datesValues = stationData.slice(7);
            const yellowLimit = parseFloat(stationData[4]);
            const selectedLevelValue = datesValues[this.selectedDateIndex];
            let style = {};
            if (
              yellowLimit === 0.0 ||
              selectedLevelValue === 0.0 ||
              selectedLevelValue < 0.0 ||
              (selectedLevelValue > -1 && selectedLevelValue < 1)
            ) {
              style = {
                radius: 0.01,
                fillColor: "#ff7800",
                color: "#000",
                weight: 0,
                opacity: 0.01,
                fillOpacity: 0.01
              };
            } else if (
              yellowLimit !== 0.0 &&
              selectedLevelValue !== 0 &&
              selectedLevelValue > 0
            ) {
              style = {
                radius:
                  yellowLimit >= selectedLevelValue
                    ? (1 - (yellowLimit - selectedLevelValue) / yellowLimit) *
                      10
                    : 10 +
                      ((selectedLevelValue - yellowLimit) / yellowLimit) * 5,
                fillColor: yellowLimit > selectedLevelValue ? "yellow" : "red",
                color: "#000",
                weight: yellowLimit > selectedLevelValue ? 1 : 2,
                opacity: 1,
                fillOpacity: yellowLimit > selectedLevelValue ? 0.5 : 1
              };
            }
            layer.setStyle(style);
          });
        }
      });
    }
  },
  crated() {
    //this.requestTableData();
    // this.gydroPostsLocations = hydroPosts
  },
  mounted() {
    this.requestTableData();
    this.$nextTick(() => {
      this.geoJson = this.$refs.geoJson.mapObject; // work as expected
    });
  },
  components: { LMap, LTileLayer, LGeoJson, LControl }
};
</script>

<style>
.v-text-field.v-text-field--solo .v-input__control {
  min-height: 10px;
}
</style>