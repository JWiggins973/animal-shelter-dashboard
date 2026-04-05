# Program:  artifact3.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Dash-based web dashboard for the Grazioso Salvare animal shelter.
#           Connects to a MongoDB database through the AnimalShelter CRUD module,
#           displays animal rescue data in an interactive table, pie chart, and map,
#           and allows filtering by rescue type using a dropdown menu.
#           Includes a summary stats bar using the count method from crudModule.

# Dash and layout imports
from dash import Dash
import dash_leaflet as dl
from dash import dcc
from dash import html
import plotly.express as px
from dash import dash_table
from dash.dependencies import Input, Output

# Data manipulation imports
import time
import numpy as np
import pandas as pd

# Local CRUD module
from crudModule import AnimalShelter

###########################
# Data Manipulation / Model
###########################

# Initialize the database connection using the AnimalShelter CRUD module.
# Credentials are loaded from the .env file inside the module.
db = AnimalShelter()

# Load all animals from the database into a DataFrame for the initial table render.
# The _id column is dropped because MongoDB's ObjectId type is not JSON serializable
# and will cause the Dash DataTable to crash if left in.
df = pd.DataFrame.from_records(db.read({}))
df.drop(columns=["_id"], inplace=True)

# Summary stats using the count method from Enhancement 3.
# These are computed once at startup and displayed in the stats bar.
TOTAL_ANIMALS = db.count({})
TOTAL_DOGS = db.count({"animal_type": "Dog"})
TOTAL_CATS = db.count({"animal_type": "Cat"})

# Column index constants for the map and tooltip callbacks.
# Using named constants instead of magic numbers makes the code easier to read
# and maintain if column positions ever change.
BREED_COL = 4  # Column index for breed
NAME_COL = 9  # Column index for animal name
LAT_COL = 13  # Column index for latitude
LON_COL = 14  # Column index for longitude

# Rescue type filter queries defined once at module level so they are not
# recreated every time the dropdown callback fires.
TRACKING_FILTER = {
    "animal_type": "Dog",
    "breed": {
        "$in": [
            "Doberman Pinscher",
            "German Shepherd",
            "Golden Retriever",
            "Bloodhound",
            "Rottweiler",
        ]
    },
    "sex_upon_outcome": "Intact Male",
    "age_upon_outcome_in_weeks": {"$gte": 20, "$lte": 300},
}

WATER_RESCUE_FILTER = {
    "animal_type": "Dog",
    "breed": {
        "$in": [
            "Labrador Retriever Mix",
            "Chesa Bay Retr Mix",
            "Newfoundland",
            "Portuguese Water Dog",
        ]
    },
    "sex_upon_outcome": "Intact Female",
    "age_upon_outcome_in_weeks": {"$gte": 26, "$lte": 156},
}

MOUNTAIN_RESCUE_FILTER = {
    "animal_type": "Dog",
    "breed": {
        "$in": [
            "German Shepherd",
            "Alaskan Malamute",
            "Old English Sheepdog",
            "Rottweiler",
        ]
    },
    "sex_upon_outcome": "Intact Male",
    "age_upon_outcome_in_weeks": {"$gte": 26, "$lte": 156},
}

#########################
# Dashboard Layout / View
#########################

# Reusable style for each stat card in the summary bar
CARD_STYLE = {
    "display": "inline-block",
    "width": "22%",
    "margin": "0 1%",
    "padding": "16px",
    "backgroundColor": "#f9f9f9",
    "borderRadius": "8px",
    "textAlign": "center",
    "boxShadow": "0 1px 4px rgba(0,0,0,0.1)",
}

app = Dash("SimpleExample")

app.layout = html.Div(
    [
        html.Div(id="hidden-div", style={"display": "none"}),
        # Logo and title
        html.Center(
            html.Img(
                src="/assets/Grazioso Salvare Logo.png",
                style={"width": "300px", "height": "auto"},
            )
        ),
        html.Center(html.B(html.H1("SNHU CS-340 Dashboard"))),
        html.H3("Created by: Jermaine Wiggins"),
        html.Hr(),
        # Summary stats bar — uses count method from Enhancement 3.
        # Updates dynamically when the rescue type filter changes.
        html.Div(
            [
                html.Div(
                    [
                        html.H2(
                            id="stat-total",
                            children=str(TOTAL_ANIMALS),
                            style={"margin": "0", "color": "#2c7bb6"},
                        ),
                        html.P("Total Animals", style={"margin": "4px 0 0"}),
                    ],
                    style=CARD_STYLE,
                ),
                html.Div(
                    [
                        html.H2(
                            id="stat-dogs",
                            children=str(TOTAL_DOGS),
                            style={"margin": "0", "color": "#2c7bb6"},
                        ),
                        html.P("Dogs", style={"margin": "4px 0 0"}),
                    ],
                    style=CARD_STYLE,
                ),
                html.Div(
                    [
                        html.H2(
                            id="stat-cats",
                            children=str(TOTAL_CATS),
                            style={"margin": "0", "color": "#2c7bb6"},
                        ),
                        html.P("Cats", style={"margin": "4px 0 0"}),
                    ],
                    style=CARD_STYLE,
                ),
                html.Div(
                    [
                        html.H2(
                            id="stat-querytime",
                            children="--",
                            style={"margin": "0", "color": "#2c7bb6"},
                        ),
                        html.P("Query time (ms)", style={"margin": "4px 0 0"}),
                    ],
                    style=CARD_STYLE,
                ),
            ],
            style={"textAlign": "center", "margin": "20px 0"},
        ),
        html.Hr(),
        # Rescue type dropdown filter
        html.Div(
            [
                dcc.Dropdown(
                    id="dropdown",
                    options=["Tracking", "Water Rescue", "Mountain Rescue"],
                )
            ]
        ),
        # Interactive data table displaying animal records
        dash_table.DataTable(
            id="datatable-id",
            columns=[
                {"name": i, "id": i, "deletable": False, "selectable": True}
                for i in df.columns
            ],
            data=df.to_dict("records"),
            editable=False,
            filter_action="native",
            sort_action="native",
            sort_mode="multi",
            column_selectable=False,
            row_selectable="single",
            selected_columns=[],
            selected_rows=[0],
            page_action="native",
            page_current=0,
            page_size=10,
        ),
        html.Br(),
        html.Hr(),
        # Breed pie chart and map displayed side by side
        html.Div(
            children=[
                html.H4("Rescue Animals Breed"),
                dcc.Graph(
                    id="graph", style={"display": "inline-block", "width": "43%"}
                ),
                html.Div(
                    id="map-id", style={"display": "inline-block", "width": "45%"}
                ),
            ]
        ),
    ]
)

#############################################
# Interaction Between Components / Controller
#############################################


@app.callback(
    Output("datatable-id", "data"),
    Output("stat-total", "children"),
    Output("stat-dogs", "children"),
    Output("stat-cats", "children"),
    Output("stat-querytime", "children"),
    Input("dropdown", "value"),
)
def dropdown_output(value):
    """Filter the data table and update summary stats based on the selected rescue type.

    If no filter is selected, all animals are shown and stats reflect the full dataset.
    Otherwise the table and stats are filtered using the matching rescue query.
    Query time is measured and displayed to demonstrate the performance benefit of indexing.
    """
    if not value:
        query = {}
    else:
        filters = []
        if "Tracking" in value:
            filters.append(TRACKING_FILTER)
        elif "Water Rescue" in value:
            filters.append(WATER_RESCUE_FILTER)
        elif "Mountain Rescue" in value:
            filters.append(MOUNTAIN_RESCUE_FILTER)
        query = {"$or": filters} if filters else {}

    # Time the database query to show indexing performance
    start = time.time()
    df = pd.DataFrame.from_records(db.read(query))
    elapsed_ms = round((time.time() - start) * 1000, 1)

    if "_id" in df.columns:
        df.drop(columns=["_id"], inplace=True)

    # Update stat counts to reflect the current filter
    total = db.count(query)
    dogs = (
        db.count({**query, "animal_type": "Dog"})
        if query
        else db.count({"animal_type": "Dog"})
    )
    cats = (
        db.count({**query, "animal_type": "Cat"})
        if query
        else db.count({"animal_type": "Cat"})
    )

    return df.to_dict("records"), str(total), str(dogs), str(cats), f"{elapsed_ms}ms"


@app.callback(
    Output("datatable-id", "style_data_conditional"),
    [Input("datatable-id", "selected_columns")],
)
def update_styles(selected_columns):
    """Highlight selected columns in the data table with a light blue background."""
    return [
        {"if": {"column_id": i}, "background_color": "#D2F3FF"}
        for i in selected_columns
    ]


@app.callback(
    Output("map-id", "children"),
    [
        Input("datatable-id", "derived_virtual_data"),
        Input("datatable-id", "derived_virtual_selected_rows"),
    ],
)
def update_map(viewData, index):
    """Update the Leaflet map to show the location of the selected animal."""
    try:
        dff = pd.DataFrame.from_dict(viewData)
        if dff.empty:
            return []

        row = index[0] if index else 0

        return [
            dl.Map(
                style={"width": "1000px", "height": "500px"},
                center=[30.75, -97.48],
                zoom=10,
                children=[
                    dl.TileLayer(id="base-layer-id"),
                    dl.Marker(
                        position=[dff.iloc[row, LAT_COL], dff.iloc[row, LON_COL]],
                        children=[
                            dl.Tooltip(dff.iloc[row, BREED_COL]),
                            dl.Popup(
                                [
                                    html.H1("Animal Name"),
                                    html.P(dff.iloc[row, NAME_COL]),
                                ]
                            ),
                        ],
                    ),
                ],
            )
        ]
    except Exception as e:
        print(f"Error in update_map: {e}")
        return []


@app.callback(
    Output("graph", "figure"),
    Input("datatable-id", "derived_virtual_data"),
)
def generate_chart(viewData):
    """Generate a pie chart showing breed distribution of currently visible animals.

    Breeds making up less than 1% of the total are grouped into an 'Other' slice
    to keep the chart readable when many breeds are present.
    """
    if not viewData:
        return {}

    dff = pd.DataFrame.from_dict(viewData)
    counts = dff["breed"].value_counts()
    total = counts.sum()

    # Group breeds below 1% of total into an 'Other' category for readability
    threshold = total * 0.01
    breeds_above_threshold = counts[counts >= threshold].copy()
    breeds_below_threshold = counts[counts < threshold].sum()

    if breeds_below_threshold > 0:
        breeds_above_threshold["Other"] = breeds_below_threshold

    new_dff = breeds_above_threshold.reset_index()
    new_dff.columns = ["breed", "count"]

    fig = px.pie(new_dff, values="count", names="breed", hole=0.3)
    return fig


app.run(debug=True)
