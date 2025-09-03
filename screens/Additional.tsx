import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Image, StyleSheet, Modal } from 'react-native';
import { Appbar, Card, Title, Paragraph, useTheme, Button as PaperButton, List, Searchbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import styles from '../styles/styles';
import QrScannerModal from './QrScannerModal';
import { QrCode, Phone, Mail, Clock, Facebook, Github } from 'lucide-react-native';
import { Linking } from 'react-native';
import CircularText from '../UI/CirculatText';
import { useNavigation } from '@react-navigation/native';
import StarBorder from './StarBorder'; 

// Import all faculty data from your single file
import { faculty } from '../Data/Faculty'; 

// Hardcoded course data to fix import issues.
const courses = {
    Cse110: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE110', type: 'SDS Webview' },
        { name: 'Drive Lecture', url: 'https://drive.google.com/drive/u/0/folders/1X6AvHdRgXy-oQgIUt9QpqhDGU_IqqP3w', type: 'Drive Folder' },
        { name: 'MSI Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQfo173BJeLyMZ9KlI7tORwW', type: 'Course Video' },
        { name: 'Python by TAW', url: 'https://youtube.com/playlist?list=PLvr0Ht-XkB_0V-mjAYlfgk-3VRmFarlzC', type: 'Course Video' },
        { name: 'Java by TAW', url: 'https://youtube.com/playlist?list=PLvr0Ht-XkB_0KC2-N3hv0V3ib-Z6wKkAy&si=iPUg6XmhB4_0U8Vn', type: 'Course Video' },
      ],
    },
    Cse111: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE111', type: 'SDS Webview' },
        { name: 'Mixed Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYELRU2IHZNUD0A4UpT8ejWu', type: 'Course Video' },
        { name: 'SAD', url: 'https://youtube.com/playlist?list=PLaVWjQSl4OrjCnQU00ES3CnimhS0Ii9Ne', type: 'Course Video' },
        { name: 'SAD(Tracing)', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQc5U2XOYzzTAcyQQLrIktG2', type: 'Course Video' },
        { name: 'Python by TAW', url: 'https://youtube.com/playlist?list=PLvr0Ht-XkB_3NAwjutgaG0-62d2yjG6qz&si=329s5uuDQX9sPd56', type: 'Course Video' },
        { name: 'Java by TAW', url: 'https://youtube.com/playlist?list=PLvr0Ht-XkB_3QPWYBje6NqEs3QLj_0vpf&si=BxcwdMNB7M3pZBbm', type: 'Course Video' },
        { name: 'LAB', url: 'https://docs.google.com/document/d/1gKLmGnWju4fRBWC5OcRCa76zMql0wUA8z0VD3rd1Dvo/edit', type: 'Notes' },
      ],
    },
    Psy101: {
      resources: [
        { name: 'AYSHA MISS', url: 'https://www.youtube.com/playlist?list=PL8ruJoNFhcPEwxKM9uPJmqKx26Ktk7dp-', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYF06zBfuyUXVRwIsFyRCtQH', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5WfeQuFa6liwvel5BJWuA_MD&si=ND9uxnWkOpuD5J9X', type: 'Course Video' },
      ],
    },
    Phy101: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYF06zBfuyUXVRwIsFyRCtQH', type: 'Course Video' },
      ],
    },
    Phy111: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQfyYxZuKc7V1aw18nZIHgkj', type: 'Course Video' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1cdNSHun3xWlRQ_XmThXRe0CA2QCqw8i0/view?usp=sharing', type: 'Notes' },
        { name: 'Assignments + Notes', url: 'https://www.playbook.com/s/bdsketch/hJebtwSeyB6Yuy2cXdmnwX4B', type: 'Playbook' },
        { name: 'Notes', url: 'https://www.playbook.com/s/bdsketch/srFLz7rzJsBrfzgogowHdHZt', type: 'Playbook' },
      ],
    },
    Phy112: {
      resources: [
        { name: 'TKT Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQegkOv8qyoy4xW5kZVdFKYF&si=3O26ZFoVVWyvnyfr', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQegkOv8qyoy4xW5kZVdFKYF', type: 'Course Video' },
        { name: 'Notes', url: 'https://drive.google.com/drive/folders/1EhHA-eEwi7DGSXZtmYWrA2LpAQD3tttS?usp=sharing', type: 'Notes' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLRWEVZnjBLkXeYL6Vn24JSI2uoGvDLhki&si=YSYAJoALQBU1DJ0M', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLWlwBmP9J5xxrdF5VPRqow5nEy0GPcGtC&si=LQrrS8WG9AKMqN78', type: 'Course Video' },
        { name: 'RDI LAB + Assignment + Notes', url: 'https://drive.google.com/drive/folders/14ayFXOn6Em2V4qBwEzqs0zEo14_H0td4', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://drive.google.com/drive/folders/1EhHA-eEwi7DGSXZtmYWrA2LpAQD3tttS?usp=sharing', type: 'Notes' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/13vMk-usiLBUTbP_lpd83H9B45MCDpj_g', type: 'Slides' },
      ],
    },
    Mat110: {
      resources: [
        { name: 'Bux Videos', url: 'https://drive.google.com/drive/folders/14lB1F_wya4yvnQ9ILYnNCWqzehch_NLM', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://anotepad.com/notes/6jrq9ffh', type: 'Notes' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5Wf2ivvurpQ-2zi6kgWGMGo0&si=0GDY8AZ7f1rbiO09', type: 'Course Video' },
      ],
    },
    Mat120: {
      resources: [
        { name: 'Reza Sir Videos', url: 'https://www.youtube.com/playlist?list=PLE3MtMBjMVLdrdZzdlzNFDx2cq5CYKWoxIntegral', type: 'Course Video' },
        { name: 'Sharepoint Folder', url: 'https://gbracuacbd-my.sharepoint.com/:f:/g/personal/shahin_sharukh_anik_g_bracu_ac_bd/Em2EJSKpEMdAoApN0XcZHfcB7usmVlAuuC4MIfdd_yrvww?e=wxqTRA', type: 'Sharepoint Folder' },
        { name: 'Notes + Assignment + Quiz + Practice Problems', url: 'https://www.playbook.com/s/bdsketch/3JB1ajDWbgnPTaQqSU52gW4j', type: 'Playbook' },
        { name: 'Notes + Quiz', url: 'https://www.playbook.com/s/bdsketch/xdGqbg588QQZ8t3XXKA8SybD', type: 'Playbook' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1d4RRJ5bYDgj95RGuIxk2-4EHjKZ0xkln/view?usp=sharing', type: 'Notes' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQfdK08koMO_YBPy-zTokdN5', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PL7XBjdiQyhKlNOh25PtdLW-R6LKEzC724', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLWJpC15qtfVotLA1C9dAzyFyU4n_RIvwm&si=2-p68Nlz3igiACYr', type: 'Course Video' },
      ],
    },
    Eco101: {
      resources: [
        { name: 'RFU Videos', url: 'https://www.youtube.com/playlist?list=PLIIEr6BC1NsT1eieKehF-Q2625w0Q5Lf5', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PL9aZtK5kh5We1lP13o92XXcmCGlYNk6kQ', type: 'Course Video' },
        { name: 'Mega Folder', url: 'https://mega.nz/folder/X1wQzSAa#z49m2IVcSW7cniXrBsabpw/folder/vxwwHSaZ', type: 'Mega Folder' },
        { name: 'Bux Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5We1lP13o92XXcmCGlYNk6kQ&si=iXVcJxAW4PHKzF-i', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5WcO3_7f8M4p-D3otJc_qHg0&si=nwsK0UlBw1u-yWbQ', type: 'Course Video' },
      ],
    },
    Eco102: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYEWRssutl6dWd2Pu7CF7QXv&si=OJN6qTqWyAu32pUy', type: 'Course Video' },
        { name: 'Mixed Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYEWRssutl6dWd2Pu7CF7QXv&si=AvxJPERryds7jkuD', type: 'Course Video' },
      ],
    },
    ENG102: {
      resources: [
        { name: 'RS Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_K4f46TegQvTCxpKb9p0VQk&si=REXNrD7fg76IfhgC', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLRJFV3c2qEElGUFHmMaT9TNKFj_POgZle&si=Di42UtQXhcPlOhth', type: 'Course Video' },
      ],
    },
    ANT101: {
      resources: [
        { name: 'ZTK Videos', url: 'https://youtube.com/playlist?list=PL5IrayslvHiHsPiJse4vJImvi8UKm2rBJ', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLOUm6fJiwrYFLCHnZPcQguGqrWZWY6sYa', type: 'Course Video' },
      ],
    },
    BUS201: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYECj1TXWk7JZRazDJCfSO3q', type: 'Course Video' },
      ],
    },
    HUM103: {
      resources: [
        { name: 'BuX Videos', url: 'https://www.youtube.com/playlist?list=PLBOVh3Vky8Al-OFqWfKpL35qZQslI8e9d', type: 'Course Video' },
        { name: 'Shaiya Miss Videos', url: 'https://www.youtube.com/playlist?list=PLCh3_NUqW7_JYyOuFUkspcy2pWiUBx5Yo', type: 'Course Video' },
      ],
    },
    FRN101: {
      resources: [
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLCh3_NUqW7_L4LS0eyKAszqI48QuoWIow', type: 'Course Video' },
      ],
    },
    CHE110: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYEqBH-G1Yv0pHtldxHd8ee2', type: 'Course Video' },
      ],
    },
    ENV103: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYHx515beqwd-8f9V_VIYPXCG', type: 'Course Video' },
      ],
    },
    GEO101: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYFSPyVwBHeDtYlPKVuY6NJ0', type: 'Course Video' },
      ],
    },
    EMB101: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLJ8-tNmGjhaqEYdrwK1wcqyXTByKcrXYm&si=nbOaBIlNL6l8IXZz', type: 'Course Video' },
      ],
    },
    ACT201: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLOUm6fJiwrYHYSMNtBFjFr-1QcoQaAowu&si=WFy1_q6FacAEpEam', type: 'Course Video' },
      ],
    },
    Cse220: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE220', type: 'SDS Webview' },
        { name: 'Practice Sheet', url: 'https://drive.google.com/drive/folders/1ADucedBDj_y72M8wuF9_JZ9TcBvjCuGp', type: 'Practice Sheet' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1d1BUDFxtOHKGwO48KveePmW0faRffSYb/view?fbclid=IwAR2Z7sReVTdJp07RjPag7Nz9Vj5QKofe2HEF55ptLirEQNEabcSmk8CZfnk', type: 'Notes' },
        { name: 'Notes + Slides + Practice sheet + Assignment', url: 'https://drive.google.com/drive/folders/1J7IZl37KdoQRPq9M7sfg93dVoB1gULk_?usp=share_link', type: 'Drive Folder' },
        { name: 'Course Materials', url: 'https://drive.google.com/drive/folders/1ZvnnNMjz3AN4r2wJ-xM1BULIDCuADM0I', type: 'Drive Folder' },
        { name: 'Midterm Materials', url: 'https://drive.google.com/drive/folders/1pJ1QOW7ytfZd6Sn8WtsP2H7N4c0air4e?fbclid=IwY2xjawKgMuJleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7nT5JhIqEWELrkrP4DaqmZG1JjnOCtNnHpLmutbknpcozFpigG-_bFdq06RA_aem_L9wcWSurxA-4waeg-PBl_w', type: 'Drive Folder' },
        { name: 'Final Materials', url: 'https://drive.google.com/drive/folders/1lugGN6rJecsr_PdvmqRUdmnqfbgypKpc?fbclid=IwY2xjawKgMw1leHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7ncbI4ds9jCO1xzuOaqgKlv080dZwMBhT9zEQaRBrziBaUR0fLM2yiHs12Zw_aem_L2ICVfJ5NlKidPETrJQo4A', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1nUy2OeNZ14E2zh0BP8TpQx-pJjjpd8l4/view?fbclid=IwY2xjawKgMhNleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7h9ijIzurQVDClyb-ph4CTok7uThyTfM5zWtU3NMmi_UrGY4xjm5lgYEXzSA_aem_MBq4nCpx2AQwYAy9iuPmtw&pli=1', type: 'Notes' },
        { name: 'Pythom Videos', url: 'https://youtube.com/playlist?list=PLp7yhNWDuCSDtXcsGIiMBNGmNctbSeiDx', type: 'Course Video' },
        { name: 'Python Videos', url: 'https://www.youtube.com/playlist?list=PLFOfwbRXCOgaP97mHKMXmh_y2tEnokX4G', type: 'Course Video' },
        { name: 'Java | Data Structure', url: 'https://youtube.com/playlist?list=PLBJgv5EOl28KRGTJHjREcFM9z0p5Ewxis&si=IT92UnvySDlJBxqr', type: 'Course Video' },
        { name: 'Python', url: 'https://youtube.com/playlist?list=PL7oKIPF7ZnjbOmZ1JWCE0xnqH-gUmCV9u&si=ZxrYXYFq2aNFhtFp', type: 'Course Video' },
      ],
    },
    Cse221: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE221', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLNDrhDXd0Qt9J_ZlWCgvt-FHm28G0Kiaf', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_LUEKMB6VGnhUveo7k70t4M', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLLmtRk3TWm61Ewvp0zse5XZqehI448vsv', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLgU-6-TtNPAzpauVSPWpKFbmu5Rbc2dEQ', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLPFDgD6kUaiRCGxuHu3GWhFHCKFTnnZV0&si=2dbEuVlGXKaXFNNg', type: 'Course Video' },
        { name: 'General Notes', url: 'https://docs.google.com/document/d/15-tHUwzf54ATsWVgI1P_UYAdRAGBIZiKSxPfkkd9gSA/edit?fbclid=IwY2xjawHk8KNleHRuA2FlbQIxMAABHci1QdxhjTETKA1xbWwU2jl7QzBm27TzRBvJ91zgdLONWrjeCiR4x_RZtw_aem_5boe2eqB88yJ_-vmn3Nb-Q&tab=t.0', type: 'Notes' },
        { name: 'Slides + Notes', url: 'https://drive.google.com/drive/folders/1EuJTeoAiPXXtdCI5O3k48XDK5_z4O7xU', type: 'Drive Folder' },
      ],
    },
    Cse230: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE230', type: 'SDS Webview' },
        { name: 'Farhan Feroz Channel', url: 'https://www.youtube.com/@farhanferoz8226', type: 'YouTube Channel' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_IpBYjcyBix7edgUsT7wWbP', type: 'Course Video' },
        { name: 'Midterm Materials', url: 'https://drive.google.com/drive/folders/1pLiyulToA0D0pz-jDx7QPw0_4vuA5_4o', type: 'Drive Folder' },
        { name: 'Final Materials', url: 'https://drive.google.com/drive/folders/1pIwuXg_yuPUIIUm8Wrcxh6yNGD8x8Bwa', type: 'Drive Folder' },
        { name: 'Book + Practice Sheet + Lecture Slide', url: 'https://drive.google.com/drive/folders/168njBvRnGkJNXFz9rzTJsBVJCQExgHck', type: 'Drive Folder' },
      ],
    },
    Cse250: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE250', type: 'SDS Webview' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1InXQaFzcpopkLLxTPJhtPY7c_D0XD7-J', type: 'Slides' },
        { name: 'Practice Sheets', url: 'https://drive.google.com/drive/folders/1Lyd9vesm1yTCy1_0CzrmSUWEwjygVmYK', type: 'Practice Sheet' },
        { name: 'Lab', url: 'https://drive.google.com/drive/folders/1vS5r47VJLmh8RJNey37f2RXB6fUrHkm9', type: 'Drive Folder' },
        { name: 'Solve Slide', url: 'https://drive.google.com/drive/folders/1NmcP1McccX7LA89RFzj5k-uNEyNCRg-8?usp=drive_link', type: 'Slides' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PL-lCYwFS3hp0hbnUd8-FzWxfQzvqt-d5w', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLaGWhzUB5BBslAOakUL8ETnMpZntxE-UV', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PL-lCYwFS3hp2iDVWtZqCqD7SP1CJduM6c', type: 'Course Video' },
      ],
    },
    Cse251: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE251', type: 'SDS Webview' },
        { name: 'Practice', url: 'https://docs.google.com/document/d/1Y5DQWqEbwzJ204owxNtz9Uz_kYvaR20z/edit?tab=t.0#heading=h.gjdgxs', type: 'Practice Sheet' },
        { name: 'Midterm', url: 'https://drive.google.com/drive/folders/1VC8TeExyFd8Kzm8ZGFfLwYvMn590UtXR', type: 'Drive Folder' },
        { name: 'Final', url: 'https://drive.google.com/drive/folders/1VC8TeExyFd8Kzm8ZGFfLwYvMn590UtXR', type: 'Drive Folder' },
        { name: 'Recordings', url: 'https://drive.google.com/drive/folders/18UPtNJTJg02RbB2C13apUxDsnPHCCBIC?usp=sharing', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://drive.google.com/drive/u/1/folders/1RSuVzuSOKNHrGs9Zzuf9FfvZRPWO1sKA', type: 'Notes' },
        { name: 'Practice (MID)', url: 'https://docs.google.com/document/d/1_prE0ZB3cQlBN34c6YD31nddDbuf3wPy_CpB3tKZk8w/edit#heading=h.m2a0l5ds7zfl', type: 'Practice Sheet' },
        { name: 'Practice (FINAL)', url: 'https://docs.google.com/document/d/19P90klMwWfc-VmW1h-MEQWUl_l1OLDeN3mdtk_muH80/edit?usp=sharing', type: 'Practice Sheet' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLvj5w6iNZqVgmrLWcUvi1GLRPLSK_Pd3X', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLgvIXc7KCwucTAca4GIRXBLPtqEMRosOq', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLaGWhzUB5BBthrRrLHpds41A29cPE0tnW&si=GKfHHaF_mU5EpE7V', type: 'Course Video' },
      ],
    },
    Cse260: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE260', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLCh3_NUqW7_IKB3PUO9ejeQVujN0SNFtB', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLzzYtJMBTYCcVH56uHLz0f7eJI0JNAEyQ', type: 'Course Video' },
        { name: 'DZK Videos', url: 'https://youtube.com/playlist?list=PLTlXQu_162Qi4Bi8S5UskgcVgBhy0wXpg&si=ntMJKCsLglg9yasi', type: 'Course Video' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/13WDcyXruuzYMhA9TDVt1Dte7CzJR9ii_', type: 'Slides' },
        { name: 'Slides + Quiz Solu + Lab assignments+ Theory assings+ Project Solution', url: 'https://www.playbook.com/s/bdsketch/B5HwHoUC5UtwycHPrjQGAz8b', type: 'Playbook' },
      ],
    },
    Mat215: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLjn0GYNs9zvyZQmXMV2NtXSvk6PYz_BG4', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PL63IQkIty91joaYSai_5431PQ9BP5pvew', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLx3F9dOqe5Km3kji6OlQ0S-MCmhUKt9yp&si=gJ6tSxlMYbzVZHqj', type: 'Course Video' },
        { name: 'Slide + Assgin + Quiz Solu', url: 'https://www.playbook.com/s/bdsketch/fBP22TKaBBgngQ1zx9CX6Xrf', type: 'Playbook' },
      ],
    },
    Mat216: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLMZnvBHNk2GXZtWLVxnWfGAAlrz3wvzf9', type: 'Course Video' },
      ],
    },
    Sta201: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLaEUQX2Nu3NniRJUC18N3osaKkK62LDha', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLCh3_NUqW7_L7Ixh7QGzHYjTU6uZumIgp', type: 'Course Video' },
        { name: 'Practice + Lecture Slide + Assignment', url: 'https://drive.google.com/drive/folders/1FVn5Sdp4Hpe4PzJI0FdRcxcDfs4sB1Fj?usp=sharing', type: 'Drive Folder' },
      ],
    },
    Cse320: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE320', type: 'SDS Webview' },
        { name: 'General', url: 'https://drive.google.com/drive/folders/1THwgkpvw_c-X0Zw9ZqL0SEiSToQO-0b7', type: 'Drive Folder' },
        { name: 'MID + FInal', url: 'https://drive.google.com/drive/folders/1VeJn-oTNJIDHLJuWXkxQBxgU8-zhWFEH', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1i9PvRrWKYhusWg9XgysBEk25621bBuaF/view?usp=sharing', type: 'Notes' },
        { name: 'General 2', url: 'https://drive.google.com/drive/folders/17z3nVgzpCDbHYPELUEGnMXaWnsSSC_iK?fbclid=IwAR1JW_CbSe5_WjWQLYnaklZ1fGwfhvoSGW8bd1eZe2qf8Psvs083KPR4v1w', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLZTczv_dAo9OVjUOAh9hHDPF6WxtHvBt5', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_IKY5IKOKCOkIHrCZQZjxwL', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL5b6Wl2Equ1a2Xcpo3bAvAoG_Nr6J86IX&si=kcwBW6cm_4MK56k4', type: 'Course Video' },
      ],
    },
    Cse321: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE321', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL4iTVKzFqrcOYQ_Cu4IIcUgLygzmUvsLG&si=jAlYnYK6hYq0Cvr5', type: 'Course Video' },
      ],
    },
    Cse330: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE330', type: 'SDS Webview' },
        { name: 'Lecture + Practice Problem', url: 'https://docs.google.com/document/d/1iBB0qw32X-3nGlKcYcpWWIX0X0gQtUf4DEGzCzC9CLs/edit', type: 'Notes' },
        { name: 'Lecture', url: 'https://docs.google.com/document/d/1Etnt2GUvRwcjQG1m0yZUozbjv488pCtuizeOM3KqIIQ/edit?fbclid=IwY2xjawIeXrxleHRuA2FlbQIxMAABHWFQO6yrLtKN62-S_WII_fsfQTZYMZAZuZpCZnqdrbWXt82v0pEzZ_pI9A_aem_BfyLrpLc4bYWz6FLsJdwAw&tab=t.0', type: 'Notes' },
        { name: 'MID + FINAL', url: 'https://drive.google.com/drive/folders/1bYPKvA8dKHVMFfqm8mv_hxrSLCr1gFbR', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLq1kE3IvmqQ61uZyJUJj0zG-OF-CE4fLa', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLI2S4r8iKOiJmRUeTfN4mVgc3PSJ7FQgk', type: 'Course Video' },
      ],
    },
    Cse331: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE331', type: 'SDS Webview' },
        { name: 'Lecture Videos', url: 'https://drive.google.com/drive/folders/11tvuLOhqTDtJiiXsUKmuMPEjKxZPZFz2', type: 'Drive Folder' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1DZtAetQGHeTZGUM1QIEqZGQ9SRoUDIx4/view?fbclid=IwY2xjawKgQOVleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7JKVke2EL_J02tK1wCZMNgjJOHJTUY7f1X5yzNQeuEbGL6iLseV_xMAQ4zEQ_aem_Lnstb0Pyjh6cjjxf-WTpPA', type: 'Notes' },
        { name: 'Midterm', url: 'https://drive.google.com/drive/folders/1qq24OO39tbwgd6nSucdW_2duTsszyth1', type: 'Drive Folder' },
        { name: 'Final', url: 'https://drive.google.com/drive/folders/12BheG46xp7QaqEaFWg3MVD1VxMlsZyj-?fbclid=IwY2xjawKgQZhleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7nT5JhIqEWELrkrP4DaqmZG1JjnOCtNnHpLmutbknpcozFpigG-_bFdq06RA_aem_L9wcWSurxA-4waeg-PBl_w', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLpqy_jyQeZnH_zRZPH_dP7ENQlcAz81_9', type: 'Course Video' },
        { name: 'ffz Videos', url: 'https://youtube.com/playlist?list=PLBENQsMXh3gz85EJ3ZCSa9l9hnUiOer-H', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLUl4u3cNGP60_JNv2MmK3wkOt9syvfQWY&si=xz6c0iOSgLWuPvlQ', type: 'Course Video' },
      ],
    },
    Cse340: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE340', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQeQ_RpnnTf46jMQKw5QP4sB', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLsheiwzPKqWd_I5uRzJIDMhfYJD35WZY5&si=tdwr6sUoi_DZ0ukU', type: 'Course Video' },
        { name: 'Videos', url: 'https://drive.google.com/drive/folders/1kU-wSwXj65Sr05nvzb2q21AvypTVagps', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://drive.google.com/drive/folders/1KWPpbAmhFq2O6KMiQ9obnpZU0rC_zSB4', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://drive.google.com/drive/folders/1hGGhPqn_is69l5CSc5_inPgmoGzCzB2E', type: 'Drive Folder' },
        { name: 'All materials', url: 'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSWcAfxURWvIEwF123nmZCAY2YwAn9xApEB46RNp8oHJKrgLwn3Qv_DRip53pqBRE36fV_OAgsNr_F2/pubhtml?gid=2060881823&single=true', type: 'General' },
      ],
    },
    Cse341: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE341', type: 'SDS Webview' },
        { name: '(External) Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_JKPROcvmNlr1t0QWmflRIy', type: 'Course Video' },
        { name: '(External Lab) Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_KNt-hLsUqj8zZmXHO7lOl0', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5Wew0eD68a0g-CKIWXINje-k&si=Flmw_pFcwptBuxbo', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5Wew0eD68a0g-CKIWXINje-k&si=xuKGav0v6i2RLvuP', type: 'Course Video' },
        { name: 'Notes', url: 'https://drive.google.com/drive/folders/10P66cCci4mqOP8cSyFRSZem6gFUsP1S-?usp=share_link', type: 'Notes' },
        { name: 'Project', url: 'https://github.com/Xmortian/Game-Store-in-Assembly', type: 'Project' },
      ],
    },
    Cse350: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE350', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLLpSkO6bcke6ovLtXTT7xUU1P8Gk1qT1q', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5WdRQC1a_rP-zZTpqtcDhORy&si=TSJretV0wfEO3oCb', type: 'Course Video' },
        { name: 'Lecture Vids', url: 'https://docs.google.com/document/d/1fOEMVM9hlIeNKMB6nBvefxJ3CxKLJvpOARNUkF_xE38/edit?usp=drivesdk', type: 'Notes' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1KedIZZEPtEPkrv3P-o4c-mCdDqWzfwqH?usp=sharing', type: 'Slides' },
        { name: 'Vids', url: 'https://docs.google.com/document/d/1Be_NeXdNTODSTrnPJgLG-cwohpezy_0dhED2ILtIpd0/edit?usp=sharing', type: 'Notes' },
      ],
    },
    Cse360: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE360', type: 'SDS Webview' },
        { name: 'Shakir Rouf Sir Videos', url: 'https://youtube.com/playlist?list=PL8I0kbow2q8HgpBEruOmyFA63ejc-QHaq', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLq1kE3IvmqQ67h-oXuk1dANicJ4YFNBoe', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL5IrayslvHiFz3p9soLwtlxDyT6KKCuDu', type: 'Course Video' },
        { name: 'UJT New Link Videos', url: 'https://youtube.com/playlist?list=PLaBp58iNG2rPjeXsQmjn4GCud0X96qq8R&si=Lfkn9Qm1goMhaqAg', type: 'Course Video' },
      ],
    },
    Cse370: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE370', type: 'SDS Webview' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1FkgbFZRvWS08QFs-BEePPkQh0O8n7Um2', type: 'Slides' },
        { name: 'Practice Sheets', url: 'https://drive.google.com/drive/folders/1IJET35EOzg30wfXER9zllV9O7g3antAU', type: 'Practice Sheet' },
        { name: 'Other', url: 'https://drive.google.com/drive/folders/1h__RHPuWDTHcghiKCx6AQSNnr6n2jei9', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLbrkVe8jT_YwMhF4TWw1Q9ETFrUIYjOPM', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/watch?v=LrgJFaHNBd4&list=PLOtP4f8D4mwC5A0aXwqIbOiQ0N-nTkUjw', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLolBlJ23We1WSlWl0YW-htAPf3DSJvKb5', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLgrAmbRAezuhRWTyOKPxvoiyNQfPo6Iv3&si=6G1GObcP6-kkg0mY', type: 'Course Video' },
      ],
    },
    Cse420: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE420', type: 'SDS Webview' },
        { name: 'Nishat Nayla Miss Videos', url: 'https://www.youtube.com/playlist?list=PLvC1QCXXPlAVU0ZeGR8ca1X_q-j6I4kVm', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5Wd9tFyYiWXcCmQpr0Lu_vm4&si=CaDOti_UgTSQosGv', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQctSUaM_mbdSpKrWO8EVJxT&si=ng6Ke4ygqjT-w7mb', type: 'Course Video' },
        { name: 'Videos', url: 'https://m.youtube.com/playlist?list=PLM9X445MI6QriAQH-8ncpZW9sXawsbj1B', type: 'Course Video' },
      ],
    },
    Cse421: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE421', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLJh97ekrGHeKnnsQqBmP1gG4Pki1OLejM', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQfdTPgMaU6PhvtGtKOgINbE', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLCh3_NUqW7_J2wA2OxXP27lyFUDBKpLpw', type: 'Course Video' },
        { name: 'Videos', url: 'https://drive.google.com/drive/folders/1MvG-zs--S50PdpmHbayl2irT8PaBjH6n', type: 'Drive Folder' },
        { name: 'Drive Folder', url: 'https://drive.google.com/drive/folders/1AbnrDSFyytekU5kBRNobpNwtixDz82Jf', type: 'Drive Folder' },
      ],
    },
    Cse422: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE422', type: 'SDS Webview' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1R7MYfPFzh8HzMYjS6cRKlN7RFeNqJyf0', type: 'Slides' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLWRpUAekvxftDKhhhNBgDK1BKFzl6Qdti', type: 'Course Video' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?app=desktop&list=PLCh3_NUqW7_KOLBOn6zGZWJY1MTNkshpZ', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLXyBH3LodMoc4_Z_G-UIowy9o5QDeaFhI&si=0QK6lmT84XskCPdn', type: 'Course Video' },
        { name: 'Notes', url: 'https://drive.google.com/file/d/1nUy2OeNZ14E2zh0BP8TpQx-pJjjpd8l4/view?fbclid=IwY2xjawKgMhNleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7h9ijIzurQVDClyb-ph4CTok7uThyTfM5zWtU3NMmi_UrGY4xjm5lgYEXzSA_aem_MBq4nCpx2AQwYAy9iuPmtw&pli=1', type: 'Notes' },
        { name: 'GENERAL', url: 'https://drive.google.com/drive/folders/159aiOW8gygSXEiTTKXP5yUu6bRTkL4k1', type: 'Drive Folder' },
        { name: 'Midterm Questions', url: 'https://drive.google.com/drive/folders/1pJ1QOW7ytfZd6Sn8WtsP2H7N4c0air4e?fbclid=IwY2xjawKgMuJleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7nT5JhIqEWELrkrP4DaqmZG1JjnOCtNnHpLmutbknpcozFpigG-_bFdq06RA_aem_L9wcWSurxA-4waeg-PBl_w', type: 'Previous Questions' },
        { name: 'Final Questions', url: 'https://drive.google.com/drive/folders/1lugGN6rJecsr_PdvmqRUdmnqfbgypKpc?fbclid=IwY2xjawKgMw1leHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7ncbI4ds9jCO1xzuOaqgKlv080dZwMBhT9zEQaRBrziBaUR0fLM2yiHs12Zw_aem_L2ICVfJ5NlKidPETrJQo4A', type: 'Previous Questions' },
      ],
    },
    Cse423: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE423', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://www.youtube.com/playlist?list=PLq1kE3IvmqQ5ako5vkhRhY7CGL1fB5qmg', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL5IrayslvHiGEnHoenkLSTqEAmmQtaoJb', type: 'Course Video' },
        { name: 'Notes + Slides', url: 'https://drive.google.com/drive/folders/17QRi10YRwzKIBgP90Cf3-bVltscpvxiR?fbclid=IwY2xjawKgNTZleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7h9ijIzurQVDClyb-ph4CTok7uThyTfM5zWtU3NMmi_UrGY4xjm5lgYEXzSA_aem_MBq4nCpx2AQwYAy9iuPmtw', type: 'Drive Folder' },
        { name: 'Videos + Practice Sheet', url: 'https://drive.google.com/file/d/1lyQEgTvTdd4JuZfh7rYAS3d1rMjh0M-D/view?fbclid=IwY2xjawKgNVNleHRuA2FlbQIxMABicmlkETF1akNZWWtjMmMwQVYwcEZ0AR7nT5JhIqEWELrkrP4DaqmZG1JjnOCtNnHpLmutbknpcozFpigG-_bFdq06RA_aem_L9wcWSurxA-4waeg-PBl_w', type: 'Drive File' },
        { name: 'Notes + Videos', url: 'https://drive.google.com/drive/u/0/folders/18jNxejAPblYXoSZ7K7UifcWuYKD5tOz_?fbclid=IwAR1gp-5zCikND5cPmZYK81c8iwuG65EmDkGG7Z7Ts7T0SvR-QLmVx7bfjyY', type: 'Drive Folder' },
        { name: 'SLides', url: 'https://drive.google.com/drive/folders/1vRWaUym0OhZB0l2HeCr2cvhp5Jz6G8Mn', type: 'Slides' },
      ],
    },
    Cse425: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL5IrayslvHiHZZU5jdzp2SEdDOuO2iMMA&feature=shared', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQcHWGNtB2JpYPhTg23M2fyV&si=9MWjqlPLENDX76i4', type: 'Course Video' },
        { name: 'ALL', url: 'https://drive.google.com/drive/folders/1l1mo8eVB9oKwY_B_JzcqsXkyJ8HKT2dE?fbclid=IwAR1F70TuRZ5v9gkWktwdxuWM5IOJal8x0I3EVNwxRiBO-8DUcgiXKf-jBZg', type: 'Drive Folder' },
      ],
    },
    Cse426: {
      resources: [
        { name: 'Videos', url: 'https://www.youtube.com/watch?v=lTSMpGEvcrY&list=PLBENQsMXh3gxal4lOjpYZFdgcq8jGaVPX', type: 'Course Video' },
        { name: 'Notes + Vids', url: 'https://drive.google.com/drive/folders/12nowKsi2NFdNksgF2z9hB5Y9OBswhofl', type: 'Drive Folder' },
      ],
    },
    Cse428: {
      resources: [
        { name: 'LAB and Theory Videos', url: 'https://www.youtube.com/playlist?app=desktop&list=PLn12JjJn-4YnoOsrIuREbn3BmshSI3lHS', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQcOyIQ5vXnbHMQNdqkAWuhq&si=zWBl0hN4X5W2RPDS', type: 'Course Video' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1Nh7nUeK8LvNq3eVqchAVnm3oYrI4UM88?usp=drive_link', type: 'Slides' },
      ],
    },
    Cse437: {
      resources: [
        { name: 'GRA ALL', url: 'https://drive.google.com/drive/folders/1yuDdWMJmGDHLpIi8oOOXGQc5wFBMVCcG', type: 'Drive Folder' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLzi4LDrZWYxbDw1iFyiJx1YPSh8GaaBlK&si=oKdtRzXyQB9qI1Mc', type: 'Course Video' },
      ],
    },
    Cse440: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLFOIrFMarApSPIwXCgl6Tw-nF4FOkF_X0&si=aCZqB2zJoP7nUhGQ', type: 'Course Video' },
      ],
    },
    Cse447: {
      resources: [
        { name: 'MIH Videos', url: 'https://youtube.com/playlist?list=PL5IrayslvHiEiq3CreAT_3u8ujQX4SXmU&si=ae-CxSMwAcB9sROv', type: 'Course Video' },
      ],
    },
    Cse460: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE460', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://www.youtube.com/watch?v=bI6yqGtp1KM&list=PLbn1ykCe23UeICjfkoruMhr3WcHWkItfa', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLcbux5FgR-JJEZLhclidmG5w6iDCAcL7Y', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLaVWjQSl4OriR3qNRAoCEr_ePRF_YwCuw', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLn12JjJn-4YkQy8uyNnkRrt4SiE4SvZDX&si=GEHEI19GNkLNnDxB', type: 'Course Video' },
      ],
    },
    Cse461: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE461', type: 'SDS Webview' },
        { name: 'RAD Videos', url: 'https://youtube.com/playlist?list=PLkE3k0P4Vrn1iw1BCGbvFxABPjSO3ktJB&si=5YMSGA9mGIPxFCqD', type: 'Course Video' },
        { name: 'RBR Videos', url: 'https://youtube.com/playlist?list=PLWCaK_oHHOY6sCTaTOe_fGmdALn-vh9lT', type: 'Course Video' },
        { name: 'combined NLY , RAD and Rafid Sir\'s online session', url: 'https://www.youtube.com/watch?v=jh4M4RFvujI&list=PLIIEr6BC1NsQb5v6xZLt-5e59zn6bYbdp', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLcVvBmM3BkTOU-LDEUUdMl_VN2DPgWrQj', type: 'Course Video' },
        { name: 'Slides + notes + Quiz', url: 'https://drive.google.com/drive/mobile/folders/1G8MDpr2eQA4exz1aCxo6v1UIar7sDDWI', type: 'Drive Folder' },
      ],
    },
    Cse470: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE470', type: 'SDS Webview' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLWCaK_oHHOY7a2WmHpzoO1EnkEoMliQzv', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLjUIUiI7C4na9VCtlPmZaVTGRoYAlPaPE', type: 'Course Video' },
        { name: 'Drive Folder', url: 'https://drive.google.com/drive/folders/1zPKxJe5xtByP6FaxDvxZBZ9N0CcETlLO', type: 'Drive Folder' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/1Wx0rmp2GPr9oZ2BsfqH4Z6X6CNzFH9h5', type: 'Slides' },
      ],
    },
    Cse471: {
      resources: [
        { name: 'Course Outlines', url: 'https://cse.sds.bracu.ac.bd/course/view/CSE471', type: 'SDS Webview' },
        { name: 'Recordings', url: 'https://youtube.com/playlist?list=PL9aZtK5kh5Wd9M-4rxicny-ruVi0dTTf3&si=WMu9Ey_l3GROTaE1', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLtQXTSdoymQes9f7x9gdoWXlzbWUf4t5o&si=Yl-UThrCK9dHlMvi', type: 'Course Video' },
        { name: 'Practice Sheet', url: 'https://drive.google.com/drive/folders/1uFdJWn_HwM2Ni8GJrA5XoHMSE6F1CVw2', type: 'Practice Sheet' },
        { name: 'Previous Questions', url: 'https://drive.google.com/drive/folders/1FHfQRDlWhW6Uu5ZRbLkXAcpM-xX-Btt0', type: 'Previous Questions' },
        { name: 'Slides', url: 'https://drive.google.com/drive/folders/11NUN4Hpj7YpLVaOm_OxwfSfvgfLGYRps', type: 'Slides' },
        { name: 'General', url: 'https://drive.google.com/drive/folders/1W2Do5ztA0J4ivVoG1torWj3l5lzmCKEt', type: 'Drive Folder' },
      ],
    },
        Cse474: {
      resources: [
        { name: 'External Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_JQaKidqDU0eIklFg3piADM', type: 'Course Video' },
        { name: 'External Project Videos', url: 'https://youtube.com/playlist?list=PLCh3_NUqW7_IK7oOEh4-qLoU4CpWGilEH', type: 'Course Video' },
      ],
    },
    Cse481: {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL-lCYwFS3hp2T0MAwY0MmQpWaQF0pmsJv', type: 'Course Video' },
      ],
    },
    'Cse482 / PHY430': {
      resources: [
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PL-lCYwFS3hp1yy4K5o5yFT7BFn5bH1s8m&si=k7aHGHGX7FgN-lxX', type: 'Course Video' },
        { name: 'Videos', url: 'https://youtube.com/playlist?list=PLvj5w6iNZqVgt_bqYyfAbZb0uD4SxtZoD', type: 'Course Video' },
      ],
    },
    'Code n quest': {
      resources: [
        { name: 'Channel', url: 'https://www.youtube.com/@codeNquest-q2j/videos', type: 'YouTube Channel' },
      ],
    },
};

const AdditionalScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [showClubs, setShowClubs] = useState(false);
    const [showBusSchedule, setShowBusSchedule] = useState(false);
    const [showImportantMails, setShowImportantMails] = useState(false);
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [showFacultyArchive, setShowFacultyArchive] = useState(false);
    // New state for the Course Resources section
    const [showCourseResources, setShowCourseResources] = useState(false);
    const [courseSearchQuery, setCourseSearchQuery] = useState('');

    const cardColors = ['#cce5cc', '#ffe0b3', '#b3d9ff', '#b3ffe0'];
    const greyishColors = ['#e0e0e0', '#cccccc', '#b3b3b3', '#999999']; // New greyish colors

    const [showOthersFaculty, setShowOthersFaculty] = useState(false);
    const [showCseFacultyWebview, setShowCseFacultyWebview] = useState(false);
    const [othersFacultySearch, setOthersFacultySearch] = useState('');

    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [clubSearchQuery, setClubSearchQuery] = useState('');
    const searchbarRef = useRef(null);

    const [isBusLoading, setIsBusLoading] = useState(true);
    const [isCseLoading, setIsCseLoading] = useState(true);

    const features = [
        { name: 'Faculty Finder', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Find Where is your Faculty')) },
        { name: 'Faculty Email Archive', action: () => handleFeatureAction(() => setShowFacultyArchive(true)) },
        { name: 'Bus Schedule', action: () => handleFeatureAction(() => setShowBusSchedule(true)) },
        { name: 'Important Mails', action: () => handleFeatureAction(() => setShowImportantMails(true)) },
        { name: 'Club Showcase', action: () => handleFeatureAction(() => setShowClubs(true)) },
        { name: 'Food Reviews', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Hangout spot and food item reviews')) },
        // Renamed 'Course Reviews' to 'Course Resources' and added action
        { name: 'Course Resources', action: () => handleFeatureAction(() => setShowCourseResources(true)) },
        { name: 'Traffic Alert', action: () => handleFeatureAction(() => Alert.alert('Feature Coming Soon', 'Alert when Heavy Traffic Near BracU')) },
    ];

    const Clubs = [
        { name: 'Chess Club (BUCHC)', image: require('../assets/Clubs/CHESS.jpg') },
        { name: 'Community Service Club (BUCSC)', image: require('../assets/Clubs/Community.jpg') },
        { name: 'Adventure Club (BUAC)', image: require('../assets/Clubs/Adventure.jpg') },
        { name: 'Art & Photography Society (BUAPS)', image: require('../assets/Clubs/Arts and Photography.jpg') },
        { name: 'Cultural Club (BUCuC)', image: require('../assets/Clubs/Culture.jpg') },
        { name: 'Debating Club (BUDC)', image: require('../assets/Clubs/Debate.jpg') },
        { name: 'Drama and Theater Forum (BUDTF)', image: require('../assets/Clubs/Drama.jpg') },
        { name: 'Entrepreneurship Forum (BUEDF)', image: require('../assets/Clubs/BUEDF.jpg') },
        { name: 'Film Club (BUFC)', image: require('../assets/Clubs/Film.jpg') },
        { name: 'Response Team (BURT)', image: require('../assets/Clubs/Response team.jpg') },
        { name: 'Association of Business Communicators (IABC)', image: require('../assets/Clubs/IABC.jpg') },
        { name: 'MONON', image: require('../assets/Clubs/Monon.jpg') },
        { name: 'Leadership Development Forum (BULDF)', image: require('../assets/Clubs/Leadership and Development.jpg') },
        { name: 'Communication & Language (BUCLC)', image: require('../assets/Clubs/Communication and language.jpg') },
        { name: 'BRAC University Research for Development Club (BURed)', image: require('../assets/Clubs/Research and development.jpg') },
        { name: 'Peace Café BRAC University (PCBU)', image: require('../assets/Clubs/Peace Cafe.jpg') },
        { name: 'Multicultural Club (BUMC)', image: require('../assets/Clubs/Multi Culture club.jpg') },
        { name: 'Business & Economics Forum (BUBeF)', image: require('../assets/Clubs/Businees and economics.jpg') },
        { name: 'Business Club (BIZBEE)', image: require('../assets/Clubs/BizBee.jpg') },
        { name: 'Finance and Accounting Club (FINACT)', image: require('../assets/Clubs/Finance Finact.jpg') },
        { name: 'Computer Club (BUCC)', image: require('../assets/Clubs/Computer.jpg') },
        { name: 'Economics Club (BUEC)', image: require('../assets/Clubs/Economics.jpg') },
        { name: 'Electrical & Electronic Club (BUEEC)', image: require('../assets/Clubs/Electrical.jpg') },
        { name: 'Law Society (BULC)', image: require('../assets/Clubs/Law.jpeg') },
        { name: 'Marketing Association (BUMA)', image: require('../assets/Clubs/Marketing.jpg') },
        { name: 'Natural Science (BUNSC)', image: require('../assets/Clubs/Natural science.jpg') },
        { name: 'Pharmacy Society (BUPS)', image: require('../assets/Clubs/Pharma.jpg') },
        { name: 'Robotics Club (ROBU)', image: require('../assets/Clubs/Robotics.jpg') },
        { name: 'Cricket Club (CBU)', image: require('../assets/Clubs/Cricket.jpg') },
        { name: 'Football Club (FCBU)', image: require('../assets/Clubs/Football.jpg') },
        { name: 'Indoor Games Club (BUIGC)', image: require('../assets/Clubs/indoor games.jpg') },
        { name: 'Brac University History Club (BUHC)', image: require('../assets/Clubs/History.jpg') },
        { name: 'BRAC University Esports Club (BUESC)', image: require('../assets/Clubs/E sports.jpg') },
    ];

    const importantContacts = [
        {
            title: 'General Information',
            address: 'Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh',
            tel: '+88 09638464646 (Ext.1001 for operator)',
            email: 'info@bracu.ac.bd',
        },
        {
            title: 'Student Information Centre (SIC)',
            services: 'Student Information, Registry, Exam Controller, Admissions',
            ivr: '+8809638464646 (press 2)',
            email: 'sic@bracu.ac.bd',
            hours: '9:00 AM to 4:30 PM',
        },
        {
            title: 'Office of the Proctor',
            services: 'Student Discipline and Safety',
            phone: '+8801313049111, +8801313049105, +8801729071209',
            email: 'proctor@bracu.ac.bd',
            hours: '9:00 AM to 5:30 PM',
        },
        {
            title: 'University Medical Centre',
            services: 'Medical Assistance',
            phone: '+8801322821534',
            email: 'medicalcenter@bracu.ac.bd',
            hours: '8:30 AM to 8:30 PM',
        },
        {
            title: 'Counseling and Wellness Centre',
            services: 'Counseling and Wellness Support',
            phone: '+8801322917314, +8801322917315',
            email: 'counseling@bracu.ac.bd',
            hours: '9:00 AM to 9:00 PM',
        },
    ];

    const generalContacts = [
        { title: 'Office of the Registrar', email: 'registrar@bracu.ac.bd' },
        { title: 'Office of the Proctor', email: 'proctor@bracu.ac.bd' },
        { title: 'Office of the Controller of Examinations', email: 'academic.records@bracu.ac.bd' },
        { title: 'Medical Centre', email: 'doctor@bracu.ac.bd' },
        { title: 'Student Information Centre (SIC)', email: 'sic@bracu.ac.bd' },
        { title: 'Student Life', email: 'studentlife@bracu.ac.bd' },
        { title: 'Office of Career Services and Alumni Relations (OCSAR)', email: 'csoadmin@bracu.ac.bd (Career Services)\nalumnisupport@bracu.ac.bd (Alumni Relations)' },
        { title: 'Office of Academic Advising (OAA)', email: 'bracu-oaa@bracu.ac.bd' },
        { title: 'Office of Co-curricular Activities (OCA)', email: 'student_org@bracu.ac.bd' },
        { title: 'Admissions office', email: 'admissions@bracu.ac.bd' },
        { title: 'Ayesha Abed Library', email: 'librarian@bracu.ac.bd' },
        { title: 'Institutional Quality Assurance Cell (IQAC)', email: 'iqac@bracu.ac.bd' },
        { title: 'Office of Communication', email: 'communications@bracu.ac.bd' },
        { title: 'Operations Office', email: 'operations@bracu.ac.bd' },
        { title: 'Accounts and Finance', email: 'queries-accounts@bracu.ac.bd' },
        { title: 'Human Resources Department', email: 'hrd@bracu.ac.bd' },
        { title: 'IT Systems Office', email: 'support@bracu.ac.bd' },
        { title: 'General Information', email: 'info@bracu.ac.bd' },
        { title: 'Counseling and Wellness Centre', email: 'counseling@bracu.ac.bd' },
        { title: 'International and Scholarship Office', email: 'international-office@bracu.ac.bd (International Office)\n scholarship@bracu.ac.bd (Scholarship Office)' },
    ];

    const handleCall = (phoneNumber) => {
        const cleanedNumber = phoneNumber.replace(/ /g, '');
        Linking.openURL(`tel:${cleanedNumber}`).catch(err => console.error('Failed to open phone app', err));
    };

    const handleEmail = (emailAddress) => {
        Linking.openURL(`mailto:${emailAddress}`).catch(err => console.error('Failed to open email app', err));
    };

    const renderClubItem = ({ item }) => (
        <TouchableOpacity
            style={[localStyles.clubListItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
                Alert.alert('Club Info', `${item.name} details coming soon`);
            }}
        >
            <Image source={item.image} style={localStyles.clubLogo} />
            <Text style={[styles.clubListItemText, { color: theme.colors.onSurface, flex: 1 }]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const handleQrCodeScanned = (data) => {
        setIsQrModalVisible(false);
        Alert.alert('QR Code Scanned', `Data: ${data}`);
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackMessage.trim()) {
            Alert.alert('Error', 'Please fill out feedback field.');
            return;
        }
        setIsSubmitting(true);
        const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSedDi2tr4POY_PocTWMDbQcw9-Fd40AIBWlP5EeFmSi8ipskw/formResponse';
        const formData = new FormData();
        formData.append('entry.1258041428', feedbackName);
        formData.append('entry.1511754014', feedbackMessage);
        try {
            await fetch(formUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors',
            });
            Alert.alert('Thank you!', 'Your feedback has been submitted.');
            setFeedbackName('');
            setFeedbackMessage('');
        } catch (error) {
            Alert.alert('Error', 'There was a problem submitting your feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Filtering logic for the main screen features
    const filteredFeatures = features.filter(feature =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredImportantContacts = importantContacts.filter(contact =>
        contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.services && contact.services.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredGeneralContacts = generalContacts.filter(contact =>
        contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClubs = Clubs.filter(club =>
        club.name.toLowerCase().includes(clubSearchQuery.toLowerCase())
    );

    const handleFeatureAction = (action) => {
        Keyboard.dismiss();
        setSearchQuery('');
        action();
    };

    // Separate CSE and other faculty members
    const otherFacultyMembers = faculty.filter(f => 
        (f.Department || f.department) !== 'Department of Computer Science and Engineering'
    );
    
    // Updated search logic to filter by word
    const filteredOthersFaculty = otherFacultyMembers.filter(f => {
        const facultyText = (
            (f["Professor Name"] || f.Name || f.name || f["Faculty Name"] || '') + ' ' +
            (f.Title || f.Designation || f.title || '') + ' ' +
            (f.Department || f.department || '') + ' ' +
            (f.Email || f.email || '')
        ).toLowerCase();
    
        const searchWords = othersFacultySearch.toLowerCase().split(' ').filter(word => word.length > 0);
    
        return searchWords.every(word => facultyText.includes(word));
    });
    
    // Logic for Course Resources screen
    const filteredCourses = Object.keys(courses).filter(courseName => 
        courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );

    // --- RENDER LOGIC ---

    if (showCourseResources) {
      return (
        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                <Appbar.BackAction onPress={() => { setShowCourseResources(false); setCourseSearchQuery(''); }} color={theme.colors.onPrimary} />
                <Appbar.Content title="Course Resources" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
            </Appbar.Header>
            <Searchbar
                placeholder="Search courses (e.g., Cse110)"
                onChangeText={setCourseSearchQuery}
                value={courseSearchQuery}
                style={{ marginHorizontal: 16, marginVertical: 8 }}
            />
            {filteredCourses.length > 0 ? (
                <FlatList
                    data={filteredCourses}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
                    renderItem={({ item: courseName }) => (
                        <Card style={[localStyles.courseCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content>
                                <Title style={{ color: theme.colors.onSurface, marginBottom: 10 }}>{courseName}</Title>
                                {courses[courseName].resources.map((resource, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        onPress={() => Linking.openURL(resource.url)}
                                        style={localStyles.resourceLinkContainer}
                                    >
                                        <Text style={localStyles.resourceLink}>
                                            <Text style={{ fontWeight: 'bold' }}>{resource.name}</Text> ({resource.type})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </Card.Content>
                        </Card>
                    )}
                />
            ) : (
                <View style={localStyles.noResultsContainer}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>No courses found.</Text>
                </View>
            )}
        </View>
      );
    }

    if (showBusSchedule) {
        return (
            <View style={{ flex: 1 }}>
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => { setShowBusSchedule(false); setIsBusLoading(true); }} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Bus Schedule" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                {isBusLoading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 1 }}>
                        <CircularText />
                    </View>
                )}
                <WebView
                    source={{ uri: 'https://www.bracu.ac.bd/students-transport-service' }}
                    style={{ flex: 1 }}
                    onLoadEnd={() => setIsBusLoading(false)}
                />
            </View>
        );
    }
    
    if (showImportantMails) {
        return (
            <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => { setShowImportantMails(false); setSearchQuery(''); }} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Important Mails" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                <Searchbar
                    placeholder="Search contacts"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ marginHorizontal: 16, marginVertical: 8 }}
                    ref={searchbarRef}
                />
                <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                        Emergency Contacts
                    </Text>
                    {filteredImportantContacts.map((contact, index) => (
                        <Card key={index} style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginBottom: 15 }]}>
                            <Card.Content>
                                <Title style={{ color: theme.colors.onSurface }}>{contact.title}</Title>
                                {contact.address && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <Text style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>{contact.address}</Text>
                                    </View>
                                )}
                                {contact.services && (
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        Services: {contact.services}
                                    </Paragraph>
                                )}
                                {contact.tel && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.tel); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.tel}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.phone && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.phone.split(',')[0]); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.phone}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.ivr && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleCall(contact.ivr); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Phone size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>IVR: {contact.ivr}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.email && (
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleEmail(contact.email.split(' ')[0]); }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                            <Mail size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>{contact.email}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {contact.hours && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                        <Clock size={18} color={theme.colors.onSurfaceVariant} />
                                        <Paragraph style={{ color: theme.colors.onSurfaceVariant, marginLeft: 10 }}>Hours: {contact.hours}</Paragraph>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    ))}
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                        General Contacts
                    </Text>
                    <List.Section>
                        {filteredGeneralContacts.map((contact, index) => (
                            <List.Item
                                key={index}
                                title={contact.title}
                                description={contact.email}
                                left={() => <List.Icon icon="email-outline" />}
                                onPress={() => { Keyboard.dismiss(); handleEmail(contact.email.split(' ')[0]); }}
                                style={{ backgroundColor: theme.colors.surface, marginBottom: 5, borderRadius: 8 }}
                                titleStyle={{ color: theme.colors.onSurface }}
                                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            />
                        ))}
                    </List.Section>
                </ScrollView>
            </View>
        );
    }
    
    if (showFacultyArchive) {
        if (showOthersFaculty) {
            return (
                <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.BackAction onPress={() => setShowOthersFaculty(false)} color={theme.colors.onPrimary} />
                        <Appbar.Content title="Other Faculty" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    </Appbar.Header>
                    <Searchbar
                        placeholder="Search all faculty"
                        onChangeText={setOthersFacultySearch}
                        value={othersFacultySearch}
                        style={{ marginHorizontal: 16, marginVertical: 8 }}
                    />
                    <FlatList
                        data={filteredOthersFaculty}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface, marginHorizontal: 16, marginVertical: 8 }]}>
                                <Card.Content>
                                    <Title style={{ color: theme.colors.onSurface }}>
                                        {item["Professor Name"] || item.Name || item.name || item["Faculty Name"]}
                                    </Title>
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        {item.Department || item.department}
                                    </Paragraph>
                                    <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                        {item.Title || item.Designation || item.title}
                                    </Paragraph>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                                            {item["Office Location"] || item["Office Level"] || item.Office || item.office || item.office_address}
                                        </Text>
                                    </View>
                                    {(item.CoursesTaught || item.courses_taught) && (
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Courses Taught:</Text>
                                            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                                                {item.CoursesTaught || item.courses_taught}
                                            </Paragraph>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => handleEmail(item.Email || item.email)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <Mail size={18} color={theme.colors.primary} />
                                            <Paragraph style={{ color: theme.colors.primary, marginLeft: 10 }}>
                                                {item.Email || item.email}
                                            </Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </Card.Content>
                            </Card>
                        )}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    />
                </View>
            );
        }
        
        if (showCseFacultyWebview) {
            return (
                <View style={{ flex: 1 }}>
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.BackAction onPress={() => { setShowCseFacultyWebview(false); setIsCseLoading(true); }} color={theme.colors.onPrimary} />
                        <Appbar.Content title="CSE Faculty Emails" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                    </Appbar.Header>
                    {isCseLoading && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 1 }}>
                            <CircularText />
                        </View>
                    )}
                    <WebView
                        source={{ uri: 'https://cse.sds.bracu.ac.bd/faculty_list' }}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setIsCseLoading(false)}
                    />
                </View>
            );
        }

        return (
            <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                    <Appbar.BackAction onPress={() => { setShowFacultyArchive(false); }} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Faculty Email Archive" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                </Appbar.Header>
                <ScrollView contentContainerStyle={styles.paddingContainer}>
                    <Card style={[styles.webviewCard, { backgroundColor: cardColors[0], marginBottom: 15, height: 120 }]}>
                        <TouchableOpacity onPress={() => setShowCseFacultyWebview(true)}>
                            <Card.Content style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>CSE</Title>
                                <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>View CSE faculty emails</Paragraph>
                            </Card.Content>
                        </TouchableOpacity>
                    </Card>
                    <Card style={[styles.webviewCard, { backgroundColor: cardColors[1], marginBottom: 15, height: 120 }]}>
                        <TouchableOpacity onPress={() => setShowOthersFaculty(true)}>
                            <Card.Content style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>Others</Title>
                                <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>View other faculty emails</Paragraph>
                            </Card.Content>
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </View>
        );
    }
    
    // The main screen remains the same
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                    <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
                    <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                        <Appbar.Content title="Additional" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                        <Appbar.Action
                            icon={() => <QrCode size={24} color={theme.colors.onPrimary} />}
                            onPress={() => setIsQrModalVisible(true)}
                        />
                    </Appbar.Header>

                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={showClubs}
                        onRequestClose={() => {
                            setShowClubs(false);
                            setClubSearchQuery('');
                        }}
                    >
                        <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
                            <Appbar.Header style={[styles.appBar, { backgroundColor: theme.colors.primary }]}>
                                <Appbar.BackAction onPress={() => setShowClubs(false)} color={theme.colors.onPrimary} />
                                <Appbar.Content title="BRACU Clubs" titleStyle={[styles.appBarTitle, { color: theme.colors.onPrimary }]} />
                            </Appbar.Header>

                            <Searchbar
                                placeholder="Search clubs"
                                onChangeText={setClubSearchQuery}
                                value={clubSearchQuery}
                                style={{ margin: 16 }}
                            />

                            <FlatList
                                data={filteredClubs}
                                renderItem={renderClubItem}
                                keyExtractor={(item) => item.name}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                            />
                        </View>
                    </Modal>

                    <ScrollView contentContainerStyle={[styles.paddingContainer, { paddingBottom: 80 }]}>
                        {/* ✅ The new, big and distinct card for Webview access */}
                        <TouchableOpacity onPress={() => navigation.navigate('Webview')}>
                            <Card style={[localStyles.webviewButtonCard, { backgroundColor: theme.colors.primary, marginBottom: 15 }]}>
                                <Card.Content style={localStyles.webviewButtonContent}>
                                    <Title style={localStyles.webviewButtonTitle}>Quick Web Links</Title>
                                    <Paragraph style={localStyles.webviewButtonSubtitle}>Access all web links in one place</Paragraph>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                        
                        <Searchbar
                            placeholder="Search features"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={{ marginBottom: 16 }}
                            ref={searchbarRef}
                        />

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                            All Features
                        </Text>
                        <View style={styles.webviewGrid}>
                            {filteredFeatures.map((feature, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.webviewCardWrapper}
                                    onPress={feature.action}
                                >
                                    <Card style={[styles.webviewCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                                        <Card.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Title style={[styles.webviewCardTitle, { color: theme.colors.onSurface }]}>{feature.name}</Title>
                                            {feature.name === 'Bus Schedule' || feature.name === 'Important Mails' || feature.name === 'Faculty Email Archive' || feature.name === 'Club Showcase' || feature.name === 'Course Resources' ? null : (
                                                <Paragraph style={[styles.webviewCardUrl, { color: theme.colors.onSurfaceVariant }]}>
                                                    Coming soon
                                                </Paragraph>
                                            )}
                                        </Card.Content>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 20 }]}>
                            Feedback
                        </Text>
                        <Card style={[styles.profileCard, { backgroundColor: '#000' }]}>
                            <Card.Content>
                                <Title style={{ color: '#fff' }}>We value your feedback</Title>
                                <Paragraph style={{ color: '#ccc', marginBottom: 10 }}>
                                    Share your thoughts or suggestions with us.
                                </Paragraph>

                                <Text style={{ color: '#fff', marginBottom: 5 }}>ID (Optional)</Text>
                                <TextInput
                                    value={feedbackName}
                                    onChangeText={setFeedbackName}
                                    style={{ backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 15 }}
                                    placeholderTextColor="#777"
                                />
                                <Text style={{ color: '#fff', marginBottom: 5 }}>Feedback</Text>
                                <TextInput
                                    value={feedbackMessage}
                                    onChangeText={setFeedbackMessage}
                                    multiline
                                    style={{ backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, height: 100 }}
                                    placeholderTextColor="#777"
                                />

                                <PaperButton
                                    mode="contained"
                                    onPress={handleFeedbackSubmit}
                                    loading={isSubmitting}
                                    style={{ marginTop: 15, backgroundColor: theme.colors.primary }}
                                    labelStyle={{ color: theme.colors.onPrimary }}
                                >
                                    Submit
                                </PaperButton>
                            </Card.Content>
                        </Card>
                         {/* --------------------
                        CREATOR INFO ADDED HERE
                        -------------------- */}
                        <View style={localStyles.creatorInfoContainer}>
                            <Text style={localStyles.creatorText}>Created by Moutmayen Nafis</Text>
                            <View style={localStyles.socialLinksContainer}>
                                <TouchableOpacity onPress={async () => {
                                    const facebookProfileId = '100008544955319';
                                    const facebookAppUrl = `fb://profile/${facebookProfileId}`;
                                    const facebookWebUrl = 'https://www.facebook.com/moutmayen/';
                                    
                                    try {
                                        const supported = await Linking.canOpenURL(facebookAppUrl);
                                        if (supported) {
                                            await Linking.openURL(facebookAppUrl);
                                        } else {
                                            await Linking.openURL(facebookWebUrl);
                                        }
                                    } catch (err) {
                                        console.error('An error occurred with Facebook linking', err);
                                        await Linking.openURL(facebookWebUrl);
                                    }
                                }}>
                                    <Facebook size={24} color={theme.colors.onSurface} style={localStyles.socialIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={async () => {
                                    const githubWebUrl = 'https://github.com/Xmortian';
                                    
                                    try {
                                        await Linking.openURL(githubWebUrl);
                                    } catch (err) {
                                        console.error('An error occurred with GitHub linking', err);
                                    }
                                }}>
                                    <Github size={24} color={theme.colors.onSurface} style={localStyles.socialIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <QrScannerModal
                        visible={isQrModalVisible}
                        onClose={() => setIsQrModalVisible(false)}
                        onQrCodeScanned={handleQrCodeScanned}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    clubListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    clubLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    webviewButtonCard: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#ddff00ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    webviewButtonContent: {
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webviewButtonTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    webviewButtonSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    courseCard: {
        marginBottom: 15,
        borderRadius: 8,
        elevation: 2,
        
    },
    resourceLinkContainer: {
        marginBottom: 8,
    },
    resourceLink: {
        color: '#4A90E2',
        fontSize: 14,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    creatorInfoContainer: {
        marginTop: 30,
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    creatorText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    socialLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialIcon: {
        marginHorizontal: 10,
    }
});

export default AdditionalScreen;