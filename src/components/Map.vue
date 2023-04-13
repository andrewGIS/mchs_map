<template>
  <v-container fluid>
    <v-overlay :value="processing" :z-index="10000">
      <v-progress-circular indeterminate color="red"></v-progress-circular>
      Загружаем данные
    </v-overlay>
    <portal to="allStationButton">
      <v-btn
        text
        v-if="!showAnimationControl && !$vuetify.breakpoint.xsOnly"
        @click="clearFilter"
      >
        <v-icon left>mdi-filter-remove</v-icon>Показать все станции
      </v-btn>
      <v-btn
        icon
        v-if="!showAnimationControl && $vuetify.breakpoint.xsOnly"
        @click="setStandartStyle"
      >
        <v-icon left>mdi-filter-remove</v-icon>
      </v-btn>
    </portal>
    <portal to="levelByButton">
      <v-btn
        text
        v-if="
          !showAnimationControl &&
            !$vuetify.breakpoint.xsOnly &&
            !this.filterText
        "
        @click="setLimitStyle"
      >
        <v-icon left>mdi-flash-alert</v-icon>НЯ и ОЯ за последний срок
      </v-btn>
      <v-btn
        icon
        v-if="
          !showAnimationControl && $vuetify.breakpoint.xsOnly && !filterText
        "
        @click="setLimitStyle"
      >
        <v-icon left>mdi-flash-alert</v-icon>
      </v-btn>
    </portal>
    <portal to="dynamicButton">
      <v-btn
        v-if="!$vuetify.breakpoint.xsOnly && !this.filterText"
        text
        @click="toggleAnimationControl"
      >
        <v-icon left>mdi-timelapse</v-icon>Динамика
      </v-btn>
      <v-btn
        icon
        v-if="$vuetify.breakpoint.xsOnly"
        @click="toggleAnimationControl"
      >
        <v-icon left>mdi-timelapse</v-icon>
      </v-btn>
    </portal>
    <portal to="MultiGraph">
      <v-btn
        v-if="!$vuetify.breakpoint.xsOnly && !this.filterText"
        text
        @click="dialogMultiChart = !dialogMultiChart"
      >
        <v-icon left>mdi-chart-histogram</v-icon> Несколько станций на графике
      </v-btn>
      <v-btn
        icon
        v-if="$vuetify.breakpoint.xsOnly"
        @click="dialogMultiChart = !dialogMultiChart"
      >
        <v-icon left>mdi-chart-histogram</v-icon>
      </v-btn>
    </portal>

    <v-row justify="center">
      <v-dialog
        style="z-index: 100000000"
        v-model="dialogMultiChart"
        width="90%"
        light
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <highcharts
            ref="highcharts"
            :options="multiChartOptions"
          ></highcharts>
          <!-- <div v-for="station in stations" :key="station.id">
            {{ station.label }}
          </div> -->

          <v-autocomplete
            v-model="valuesMulti"
            :items="stations"
            outlined
            dense
            chips
            small-chips
            label="Выберите станции"
            multiple
            item-text="label"
            item-value="id"
          ></v-autocomplete>
          <div style="font-weight:600">
            Курсор показывает уровень: {{ this.selectedLevel }}
          </div>
        </v-card>
      </v-dialog>
      <v-dialog
        style="z-index: 100000000"
        v-model="dialog"
        width="90%"
        light
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <highcharts ref="highcharts" :options="chartOptions"></highcharts>
        <!-- </v-card> -->
      </v-dialog>
      <v-container fluid style="height: 86vh">
        <l-map :center="[59, 59]" :zoom="zoom" @update:zoom="zoomUpdate">
          <l-control
            position="bottomright"
            v-if="showAnimationControl && infoShow"
          >
            <v-card max-width="300" outlined>
              <v-card-title
                >Информация о анимации
                <v-icon @click="infoShow = !infoShow">mdi-close</v-icon>
              </v-card-title>
              <v-card-text>
                Cтанции, где уровень не превысил НЯ, помечены желтым цветом. Чем
                больше круг тем ближе значения уровня воды на выбранную дату к
                уровню НЯ.
                <br />Станции, где уровень превысил НЯ, показаны красным. Чем
                больше круг, тем дальше отметка уровня воды от уровня НЯ
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
              <v-row
                v-if="showAnimationControl"
                no-gutters
                align="baseline"
                justify="end"
              >
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="prevDate()"
                        v-on="on"
                        :disabled="isAnimation || selectedDateIndex === 0"
                      >
                        <v-icon :size="25"
                          >mdi-skip-previous-circle-outline</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Предыдущая дата</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="5" style="z-index: 1000">
                  <v-select
                    solo
                    :items="actualFormattedDates"
                    v-model="selectedDate"
                    :disabled="isAnimation"
                  ></v-select>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="nextDate()"
                        v-on="on"
                        :disabled="
                          isAnimation ||
                            selectedDateIndex === actualTable.dates.length - 1
                        "
                      >
                        <v-icon class="group pa-2" :size="25"
                          >mdi-skip-next-circle-outline</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Следующая дата</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="startAnimation()"
                        v-on="on"
                        :disabled="isAnimation"
                      >
                        <v-icon>mdi-play-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Запустить анимацию</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="1">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        @click="stopAnimation()"
                        icon
                        v-on="on"
                        :disabled="!isAnimation"
                      >
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
          <l-geo-json
            v-if="isFilter"
            ref="geoJson"
            :geojson="gydroPostsLocations"
            :options="optionsBaseGeoJSON"
          ></l-geo-json>
          <l-geo-json
            v-if="isFilter"
            ref="labelgeoJson"
            :geojson="gydroPostsLocations"
            :options="optionsLabelGeoJSON"
          ></l-geo-json>
          <l-geo-json
            ref="geoJsonAdd"
            :geojson="addGydroPostsLocations"
            :options="optionsGeoJSON"
          ></l-geo-json>
          <l-geo-json
            :visible="gtsVisible"
            ref="GTS"
            :geojson="gtsData"
            :options="optionsGeoJSON"
          ></l-geo-json>
          <l-control :position="'bottomleft'">
            <v-card>
              <v-col>
                <v-row>
                  <svg height="20" width="20">
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="black"
                      stroke-width="1"
                      fill="#ff7800"
                    />
                  </svg>
                  <span style="padding-right: 5px"
                    >- временные водомерные посты ОМСУ
                  </span>
                </v-row>
                <v-row>
                  <svg height="20" width="20">
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="black"
                      stroke-width="1"
                      fill="#4ED8F5"
                    />
                  </svg>
                  - точки наблюдения ЕСИМО
                </v-row>
                <v-tooltip right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-row
                      class="GTSLayer"
                      :class="[gtsVisible ? 'layer_enabled' : 'layer_disabled']"
                      @click="gtsVisible = !gtsVisible"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <svg height="20" width="20">
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          stroke="black"
                          stroke-width="1"
                          fill="#4245f5"
                        />
                      </svg>
                      - ГТС ПК
                    </v-row>
                  </template>
                  <span>Нажмите чтобы включить/отключить слой</span>
                </v-tooltip>
                <v-row class="pl-1">
                  Последнее изменение документа:
                  <br />
                  {{ info }}
                </v-row>
              </v-col>
            </v-card>
          </l-control>
          <l-control
            :position="'topleft'"
            v-if="
              !$vuetify.breakpoint.xsOnly &&
                !showAnimationControl &&
                !settedLimitedStyle
            "
          >
            <v-card>
              <v-col>
                <v-text-field
                  label="Быстрый фильтр"
                  v-model="filterText"
                  placeholder="ID, река, нас.пункт ..."
                >
                </v-text-field>
              </v-col>
            </v-card>
          </l-control>
        </l-map>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
//const  hydroPosts = hydroPosts
import L, { Icon } from "leaflet";
import { LControl, LGeoJson, LMap, LTileLayer } from "vue2-leaflet";
import { hydroPosts } from "@/assets/gydroPostsLocation";
import { addHydroPosts } from "@/assets/addGydroPostsLocation";
import { GTS } from "@/assets/GTS";
// import { data } from process.env.BASE_URL+"public/addData.js";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default {
  data() {
    return {
      isFilter: true,
      tables: [
        {
          link:
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vSExk-xC5mNfpyh_Ul5iyXkftuMdcgsLHEqCpyvCaEhUFlDXQaX6aqv_uCclYBO_g/pub?gid=1875061110&single=true&output=csv",
          name: "r2020Data",
          dates: this.getDates(new Date(2020, 3, 16), new Date(2020, 5, 8)),
          color: "#A0A0A0",
          needFilter: false,
          columnsToSkip: 7
        },
        {
          link:
            "https://docs.google.com/spreadsheets/d/1inv46ksTI-945BjGIWr2SKpiQ4-5Oxy3Ce3-h1QMa40/gviz/tq?tqx=out:csv&range=A6:VF150",
          name: "r2021Data",
          dates: this.getDates(new Date(2021, 3, 5), new Date(2021, 4, 31)),
          color: "#A0A0A0",
          needFilter: true,
          columnsToSkip: 8
        },
        {
          link:
            "https://docs.google.com/spreadsheets/d/1A9XakXmUinbT9ee5nesoYiJGoLR9O6xpL24N-aEEW8Y/gviz/tq?tqx=out:csv&range=A6:VF127",
          name: "r2022Data",
          dates: this.getDates(new Date(2022, 3, 5), new Date(2022, 4, 31)),
          color: "#A0A0A0",
          needFilter: true,
          columnsToSkip: 8
        },
        {
          link:
            "https://docs.google.com/spreadsheets/d/1Fj3dAJv_XjkSHipvr4Xw5YsrcPN21usuKKHp79J9kT8/gviz/tq?tqx=out:csv&range=A6:XD135",
          name: "r2023Data",
          dates: this.getDates(new Date(2023, 2, 27), new Date(2023, 4, 28)),
          color: "#A0A0A0",
          needFilter: true,
          columnsToSkip: 8
        }
      ],
      actualDataName: "r2023Data",
      filterText: "",
      zoom: 6,
      infoShow: true,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      gydroPostsLocations: hydroPosts,
      addGydroPostsLocations: addHydroPosts,
      gtsData: GTS,
      gtsVisible: false,
      csvData: null,
      dialog: false,
      selectedNum: null,
      setStyle: false,
      showAnimationControl: false,
      selectedDate: null,
      isAnimation: false,
      timer: "",
      addData: null,
      clickedLayer: "",
      processing: false,
      settedLimitedStyle: false,
      dialogMultiChart: false,
      valuesMulti: [],
      selectedLevel: "-",
      basePointStyle: {
        radius: 5,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      info: document.lastModified
    };
    //https://sheets.googleapis.com/v4/spreadsheets/1y_fN6NlTw_XVpEK4mlt-EUD5koA1JsNk/values/Уровни воды 107 ВВП!A1:D5
  },
  computed: {
    actualFormattedDates() {
      return this.actualTable.dates.map(date => {
        return {
          value: date,
          text: date.toLocaleString()
        };
      });
    },
    actualTable() {
      return this.tables.find(table => table.name === this.actualDataName);
    },
    actualData() {
      if (!this.csvData) return [];
      return this.csvData[this.actualDataName];
    },
    tableSeries() {
      if (!this.clickedData) return [];
      return this.tables.map(table => {
        const year = table.dates[0].getFullYear();
        return {
          name: `Уровень воды ${year} см, ${
            this.clickedData[table.name]?.name
          }`,
          id: table.name,
          data: this.clickedData[table.name]?.data,
          accessibility: {
            enabled: table.name === this.actualDataName
          },
          visible: table.name === this.actualDataName,
          color: table.color
        };
      });
    },
    chartOptions() {
      const ctx = this;
      return {
        lang: {
          noData: "No data"
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030"
          }
        },
        legend: {
          enabled: true
        },
        title: {
          text: this.selectedName
        },
        series: this.tableSeries,
        yAxis: [
          {
            max: this.clickedData[this.actualDataName].maxValue,
            title: {
              text: "Уровень воды, см"
            },
            plotLines: [
              {
                color: "blue", // Color value
                value: this.clickedData[this.actualDataName].yellowLimit, // Value of where the line will appear
                width: 2, // Width of the line,
                dashStyle: "shortdash",
                label: {
                  align: "right",
                  text: `НЯ от "0" графика поста,  ${
                    this.clickedData[this.actualDataName].yellowLimit
                  } см`
                },
                zIndex: 1.5
              },
              {
                color: "red", // Color value
                value: this.clickedData[this.actualDataName].redLimit, // Value of where the line will appear
                width: 2,
                dashStyle: "shortdash",
                label: {
                  text: `ОЯ от "0" графика поста, ${
                    this.clickedData[this.actualDataName].redLimit
                  } см`
                },
                zIndex: 1.5 // Width of the line
              }
            ]
          }
        ],
        xAxis: [
          {
            type: "datetime",
            labels: {
              enabled: false
            },
            title: {
              text: "Сроки измерения"
            },
            min:
              this.clickedLayer === "BaseLayer"
                ? Math.min(
                    ...this.actualTable.dates.map(date =>
                      this.dateToRelative(date)
                    )
                  )
                : null,
            max:
              this.clickedLayer === "BaseLayer"
                ? Math.max(
                    ...this.actualTable.dates.map(date =>
                      this.dateToRelative(date)
                    )
                  )
                : null
          }
        ],
        tooltip: {
          formatter: function() {
            let date;
            switch (ctx.clickedLayer) {
              case "BaseLayer":
                // Информация по текущему году
                if (this.series.options.id === ctx.actualDataName) {
                  date = new Date(this.x);
                  const actualYear = ctx.actualTable.dates[0].getFullYear();
                  date.setFullYear(actualYear);
                  const dateIdx = ctx.actualTable.dates.findIndex(
                    d => Number(d) === Number(date)
                  );

                  const baseMessage = `Уровень воды ${actualYear}, см: <br> на ${date.toLocaleString()}:<b>${
                    this.y
                  }`;

                  const infos = [
                    {
                      startIndex: 1,
                      name: "Количество подтопленных жилых домов"
                    },
                    {
                      startIndex: 2,
                      name: "Количество населения в зоне подтопления (общее)"
                    },
                    {
                      startIndex: 3,
                      name: "Количество населения в зоне подтопления (детей)"
                    },
                    {
                      startIndex: 4,
                      name:
                        "Количество участков, приусадебных территорий в зоне подтопления"
                    }
                  ];

                  const addInfo = infos.map(info => {
                    const value = ctx.selectedRowData
                      .slice(info.startIndex)
                      .filter((value, idx) => {
                        if (idx % 5 === 0) return value;
                      });
                    return `<br>${info.name} - ${value[dateIdx]}`;
                  });

                  return [baseMessage, ...addInfo].join();
                } else {
                  // Информация по другим годам
                  date = new Date(this.x);
                  const archiveSeries = ctx.tables.find(
                    table => table.name === this.series.options.id
                  );
                  const archiveYear = archiveSeries.dates[0].getFullYear();
                  date.setFullYear(archiveYear);
                  return `Уровень воды ${archiveYear}, см: ${date.toLocaleString()}:${
                    this.y
                  }`;
                }
              case "ESIMO":
                date = new Date(this.x);
                date.setFullYear(2023);
                return `${new Date(date - 3600 * 5 * 1000).toLocaleString()}:${
                  this.y
                }`;
            }
          }
        }
      };
    },
    stations() {
      return (this.actualData || []).map(row => ({
        id: Number(row[0]),
        label: `${row[0]}, ${row[1]}, ${row[2]}`
      }));
    },
    multiChartOptions() {
      return {
        chart: {
          zoomType: "x"
        },
        lang: {
          noData: "No data"
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030"
          }
        },
        legend: {
          enabled: true
        },
        title: {
          text: this.clickedData.title
        },
        series: this.multiChartData.map(value => ({
          name: value.name,
          data: value.data
        })),
        yAxis: [
          {
            /*max: this.clickedData.maxValue,*/
            title: {
              text: "Уровень воды, см"
            },
            plotLines: [
              ...this.multiChartData.map(value => ({
                color: "blue", // Color value
                value: value.yellowLimit, // Value of where the line will appear
                width: 2,
                dashStyle: "shortdash",
                zIndex: 1.5, // Width of the line
                events: {
                  mouseover: () => {
                    this.selectedLevel = `НЯ от "0" графика поста, ${value.yellowLimit} см, ${value.name}`;
                  },
                  mouseout: () => {
                    this.selectedLevel = "-";
                  }
                }
              })),
              ...this.multiChartData.map(value => ({
                color: "red", // Color value
                //dashStyle: "longdashdot", // Style of the plot line. Default to solid
                value: value.redLimit, // Value of where the line will appear
                width: 2,
                dashStyle: "shortdash",
                zIndex: 1.5, // Width of the line
                events: {
                  mouseover: () => {
                    this.selectedLevel = `ОЯ от "0" графика поста, ${value.redLimit} см, ${value.name}`;
                  },
                  mouseout: () => {
                    this.selectedLevel = "-";
                  }
                }
              }))
            ]
            // ymax: this.clickedData.redLimit + 50,
          }
        ],
        xAxis: [
          {
            //type: this.clickedLayer === "BaseLayer" ? "datetime" : "linear",
            type: "datetime",
            //categories: this.timeIntervals,
            labels: {
              enabled: false
            },
            title: {
              text: "Сроки измерения"
            }
            //min: Math.min(...this.actualTable.dates) //7372800000
            //min: 8150400000
            //max: 12938400000
            //min: 8150400000,
            //max: 12938400000
          }
        ],
        tooltip: {
          formatter: function() {
            let date;
            date = new Date(this.x);
            date.setFullYear(2022);
            return `${date.toLocaleString()}:
            <br>Уровень воды:<b>${this.y}</b>`;
          }
        }
      };
    },
    multiChartData() {
      return this.valuesMulti.map(value => {
        return this.getStationDataFromCSV(
          this.csvData[this.actualDataName],
          value,
          this.actualTable.dates,
          this.actualTable.columnsToSkip,
          this.actualTable.needFilter
        );
      });
    },
    selectedDateIndex() {
      return this.actualTable.dates.indexOf(this.selectedDate);
    },
    clickedData() {
      const result = {};
      switch (this.clickedLayer) {
        case "BaseLayer":
          if (this.selectedNum) {
            for (const table of this.tables) {
              const table_name = table.name;
              const stationData = this.getStationDataFromCSV(
                this.csvData[table_name],
                this.selectedNum,
                table.dates,
                table.columnsToSkip,
                table.needFilter
              );
              if (stationData) {
                result[table_name] = stationData;
              }
            }
            return result;
          } else {
            for (const table of this.tables) {
              result[table.name] = { levels: [], station_name: "Не найдено" };
            }
            return result;
          }
        case "ESIMO":
          var selectedStation;
          this.addData.forEach(e => {
            if (e.aaData[0] && e.aaData[0][0] === this.selectedNum) {
              selectedStation = e.aaData;
              return;
            }
          });

          if (!selectedStation) {
            return {
              oldData: [],
              data: [],
              title: [],
              yellowLimit: 0,
              redLImit: 0,
              maxValue: 0
            };
          }

          // Column were data with water levels is stored
          var levelWaterColIdx = 5;

          var waterLevels = selectedStation.map(e => {
            return [
              new Date(e[4]) - new Date(2022, 0, 1),
              parseFloat(e[levelWaterColIdx])
            ];
            //return parseFloat(e[levelWaterColIdx]);
          });

          var nonNanArray = waterLevels.filter(
            value => !Number.isNaN(value[1])
          );
          var maxValue = Math.max(...nonNanArray.map(value => value[1])) + 100;

          return {
            oldData: [],
            data: selectedStation ? waterLevels : [],
            title: selectedStation[0][1],
            yellowLimit: 0,
            redLImit: 0,
            maxValue
          };
        default:
          for (const table of this.tables) {
            result[table.name] = { levels: [], station_name: "Не найдено" };
          }
          return result;
      }
    },
    optionsGeoJSON() {
      return {
        onEachFeature: this.onEachFeature,
        pointToLayer: this.pointToLayer
      };
    },
    optionsBaseGeoJSON() {
      return {
        onEachFeature: this.onEachFeature,
        pointToLayer: this.pointToLayer,
        filter: this.filterGeojson
      };
    },
    optionsLabelGeoJSON() {
      return {
        pointToLayer: this.pointToLayerLabel,
        filter: this.filterGeojson
      };
    },
    pointToLayer() {
      return (feature, latlng) => {
        // For Esimo points
        if (Object.prototype.hasOwnProperty.call(feature.properties, "m4202")) {
          return L.circleMarker(latlng, {
            ...this.basePointStyle,
            fillColor: "#4ED8F5"
          });
        } else if (
          Object.prototype.hasOwnProperty.call(feature.properties, "N")
        ) {
          // Base layer style
          return L.circleMarker(latlng, {
            ...this.basePointStyle,
            fillColor: "#ff7800"
          });
        } else {
          // GTS layer
          return L.circleMarker(latlng, {
            ...this.basePointStyle,
            fillColor: "#4245f5"
          });
        }
      };
    },
    onEachFeature() {
      return (feature, layer) => {
        // ESIMO layer tooltip
        if (Object.prototype.hasOwnProperty.call(feature.properties, "m4202")) {
          const tooltipContent =
            "<div>" +
            `Название станции : <b>${feature.properties.m4202}</b>` +
            "<div>";
          layer.bindTooltip(tooltipContent);
          layer.on({
            click: e => {
              this.clickedLayer = "ESIMO";
              this.selectedNum = e.target.feature.properties.m4200;
              this.dialog = true;
            }
          });
        } else if (
          Object.prototype.hasOwnProperty.call(feature.properties, "N")
        ) {
          // Base layer style
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
              this.clickedLayer = "BaseLayer";
              this.selectedNum = e.target.feature.properties.N;
              this.dialog = true;
            }
          });
        } else {
          // GTS layer
          const tooltipContent =
            "<div>" + `Название: <b>${feature.properties.Name}</b>` + "<div>";
          layer.bindTooltip(tooltipContent);
        }
      };
    },
    filterGeojson() {
      return feature => {
        const text = this.filterText.toString().toLowerCase();
        const props = ["N", "Settlement", "stream", "District"];
        const find = props
          .map(field => {
            return feature.properties[field]
              .toString()
              .toLowerCase()
              .includes(text);
          })
          .some(f => f === true);
        return !(Boolean(this.filterText) && !find);
      };
    },
    selectedRowData() {
      return this.actualData
        .find(row => Number(row[0]) === this.selectedNum)
        .slice(8);
    },
    pointToLayerLabel() {
      if (!this.showLabels) {
        return (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 0,
            opacity: 0.0,
            fillOpacity: 0.0
          });
        };
      } else {
        return (feature, latlng) => {
          let label = String(feature.properties.Settlement);
          return L.circleMarker(latlng, {
            fillColor: "#ff7800",
            radius: 0,
            color: "#000",
            weight: 1,
            opacity: 0.01,
            fillOpacity: 0.0
          })
            .bindTooltip(label, {
              direction: "bottom",
              permanent: true,
              // opacity: 0.7,
              className: "my-labels"
            })
            .openTooltip();
        };
      }
    },
    selectedName() {
      if (!this.selectedNum) return;
      const selectedRow = this.actualData.find(
        row => Number(row[0]) === Number(this.selectedNum)
      );
      const [town, name] = [selectedRow[2], selectedRow[3]];
      return `Номер в таблице ${this.selectedNum}; город - ${town}; название - ${name}`;
    },
    showLabels() {
      return (
        this.zoom > 8 && !this.showAnimationControl && !this.settedLimitedStyle
      );
    }
  },
  methods: {
    dateToRelative(date) {
      return new Date(
        date - Date.parse(`${date.getFullYear()}-01-01`)
      ).valueOf();
    },
    getDates(from, to) {
      const cFrom = new Date(from);
      const cTo = new Date(to);

      const daysArr = [];
      let tempDate = cFrom;

      while (tempDate < cTo) {
        daysArr.push(new Date(tempDate.setHours(8)));
        daysArr.push(new Date(tempDate.setHours(18)));
        tempDate.setDate(tempDate.getDate() + 1);
      }

      return daysArr;
    },
    async getData(url) {
      const response = await fetch(url);
      return await response.text();
    },
    getStationDataFromCSV(
      data,
      id,
      dates,
      columnsToSkip = 8,
      needFilter = true
    ) {
      const selectedRow = data.filter(row => Number(row[0]) === id)[0];
      if (!selectedRow) {
        console.warn(`Не найдена запись в таблице с ID ${id}`);
        return {
          id: id,
          name: "Не найдено",
          data: [],
          yellowLimit: null,
          redLimit: null,
          maxValue: null
        };
      }

      // In table for each dates 5 values are preseneted
      // water level, damaged houses count, damaged children (2 cols), damaged houses count
      // for extracting water levels we extract only each fifth value
      let waterLevels = selectedRow.slice(columnsToSkip);
      if (needFilter) {
        waterLevels = waterLevels.filter((value, idx) => idx % 5 === 0);
      }
      waterLevels = waterLevels.map(value => parseFloat(value));

      const nonNanArray = waterLevels.filter(value => !Number.isNaN(value));
      const maxValue = Math.max(...nonNanArray);
      const yellowLimitValue = parseFloat(selectedRow[5]);
      const redLimitValue = parseFloat(selectedRow[6]);
      const maxObservedValue =
        maxValue > redLimitValue
          ? maxValue + 100
          : redLimitValue + 0.1 * redLimitValue;

      const waterLevelsWithDates = waterLevels.map((value, idx) => {
        let date;
        try {
          date = this.dateToRelative(dates[idx]);
        } catch {
          date = null;
        }

        return [date, parseFloat(value)];
      });

      return {
        id: id,
        name: `${selectedRow[1]}, ${selectedRow[2]}`,
        data: waterLevelsWithDates,
        yellowLimit: yellowLimitValue,
        redLimit: redLimitValue,
        maxValue: maxObservedValue
      };
    },
    stopAnimation() {
      clearInterval(this.timer);
      this.isAnimation = false;
      // cancelAnimationFrame(this.request)
    },
    startAnimation() {
      this.isAnimation = true;
      let index = this.selectedDateIndex;
      this.timer = setInterval(() => {
        if (index < this.actualTable.dates.length) {
          this.selectedDate = this.actualTable.dates[index];
          index += 1;
        }
      }, 500);
    },
    nextDate() {
      this.selectedDate = this.actualTable.dates[this.selectedDateIndex + 1];
    },
    prevDate() {
      this.selectedDate = this.actualTable.dates[this.selectedDateIndex - 1];
    },
    toggleAnimationControl() {
      if (this.showAnimationControl) this.setStandartStyle(); // set default style
      this.showAnimationControl = !this.showAnimationControl;
      this.selectedDate = this.selectedDate ? null : this.actualTable.dates[0];
      this.infoShow = true;
    },
    async requestTableData() {
      this.processing = true;
      let data;

      const addData = await fetch(`${process.env.BASE_URL}data/addData.json`);
      data = await addData.json();
      this.addData = data.data;

      const tablesData = {};
      for (const table of this.tables) {
        let data = await this.getData(table.link);
        data = this.CSVToArray(data);
        if (table.name === "r2020Data") {
          data = data.slice(4);
        }
        tablesData[table.name] = data;
      }
      this.csvData = tablesData;

      this.processing = false;
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
      this.settedLimitedStyle = true;
      // middle (yellow level of danger)
      // 4 column  index of this value 4
      // red (red level of danger)
      // 5 column  index of this value 5
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            const info = this.getStationDataFromCSV(
              this.csvData[this.actualDataName],
              layer.feature.properties.N,
              this.actualTable.dates,
              this.actualTable.columnsToSkip,
              this.actualTable.needFilter
            );

            //[date, value] => [value]
            const nonNanArray = info.data
              .map(value => value[1])
              .filter(value => !Number.isNaN(value));

            let lastNonZeroValue = nonNanArray.slice(-1)[0];
            const maxValue =
              nonNanArray.length === 0 ? 0.0 : Math.max(...nonNanArray);
            let style;
            // if between yellow and red return yellow
            // if above red return red
            // default "#ff7800"
            if (
              lastNonZeroValue >= info.yellowLimit &&
              lastNonZeroValue < info.redLimit
            ) {
              style = {
                radius: 7,
                fillColor: "yellow",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              };
            } else if (
              lastNonZeroValue >= info.redLimit &&
              info.redLimit !== 0.0
            ) {
              style = {
                radius: 10,
                fillColor: "red",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              };
            } else if (maxValue === 0.0) {
              style = {
                radius: 0.01,
                fillColor: "#ff7800",
                color: "#000",
                weight: 0,
                opacity: 0.01,
                fillOpacity: 0.01
              };
            } else {
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
    setStandartStyle() {
      this.settedLimitedStyle = false;
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
    },
    zoomUpdate(zoom) {
      this.zoom = zoom;
    },
    clearFilter() {
      this.setStandartStyle();
      this.filterText = "";
    }
  },
  watch: {
    selectedDate: function() {
      this.$nextTick(() => {
        if (this.$refs.geoJson && this.$refs.geoJson.mapObject) {
          //if (this.$refs.geoJson) {
          this.$refs.geoJson.mapObject.eachLayer(layer => {
            // define radius
            const info = this.getStationDataFromCSV(
              this.csvData[this.actualDataName],
              layer.feature.properties.N,
              this.actualTable.dates,
              this.actualTable.columnsToSkip,
              this.actualTable.needFilter
            );
            const yellowLimit = info.yellowLimit;
            const values = info.data
              .map(value => value[1])
              .map(value => (Number.isNaN(value) ? 0 : value));
            const selectedLevelValue = values[this.selectedDateIndex];

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
    },
    // https://github.com/vue-leaflet/Vue2Leaflet/issues/217
    filterText: function() {
      this.isFilter = false;
      this.$nextTick(() => {
        this.isFilter = true;
      });
    }
  },
  mounted() {
    this.requestTableData();
  },
  components: { LMap, LTileLayer, LGeoJson, LControl }
};
</script>

<style>
.v-text-field.v-text-field--solo .v-input__control {
  min-height: 10px;
}
.leaflet-tooltip.my-labels {
  /* background-color: transparent; */
  border: transparent;
  box-shadow: none;
  padding: unset;
  border: unset;
}
.leaflet-tooltip-bottom:before {
  border: unset !important;
}
.GTSLayer:hover {
  cursor: pointer;
}
.layer_enabled {
  color: black;
}
.layer_disabled {
  color: #c8c8c8;
}
</style>
