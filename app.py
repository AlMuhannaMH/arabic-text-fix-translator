import streamlit as st
import pandas as pd
from googletrans import Translator
import re

st.set_page_config(page_title="Arabic Text Fix & Translate", layout="centered")

st.title("📄 Arabic Text Fix & Translate Tool")
st.write("Upload your Excel file. The tool will process rows M2 to M400, fix Arabic text, translate it to English, and let you download the updated file.")

uploaded_file = st.file_uploader("Upload Excel File", type=["xlsx"])

def is_arabic(text):
    return any('\u0600' <= c <= '\u06FF' for c in str(text))

def fix_arabic_spacing(text):
    text = re.sub(r'([^\s])(/)', r'\1 /', str(text))
    text = re.sub(r'([^\s])([A-Z])', r'\1 \2', str(text))
    return text

def translate_arabic(text):
    translator = Translator()
    try:
        return translator.translate(text, src='ar', dest='en').text
    except:
        return text

if uploaded_file:
    df = pd.read_excel(uploaded_file)
    st.success("File uploaded successfully!")

    try:
        df_subset = df.iloc[1:400].copy()
        df_subset['AC'] = df_subset.iloc[:, 12].apply(lambda x: fix_arabic_spacing(x) if is_arabic(x) else x)
        df_subset['AD'] = df_subset['AC'].apply(lambda x: translate_arabic(x) if is_arabic(x) else x)

        df.loc[1:400, 'AC'] = df_subset['AC'].values
        df.loc[1:400, 'AD'] = df_subset['AD'].values

        st.write("✅ Preview of processed data:")
        st.dataframe(df[['AC', 'AD']].iloc[1:20])

        st.download_button(
            label="📥 Download Updated Excel",
            data=df.to_excel(index=False, engine='openpyxl'),
            file_name="translated_output.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        st.error(f"Error processing file: {e}")
