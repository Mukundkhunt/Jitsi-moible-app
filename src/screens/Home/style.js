import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Colors } from "../../helper/colors/Colors";
import { Fonts } from "../../helper/fonts/Fonts";


const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: Colors.AppColor,
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    logo: {
        height: hp(9.36),
        width: hp(9.36),
        borderRadius: 5,
        backgroundColor: Colors.themeColor,
        alignSelf: 'center',
        marginTop: hp(10)
    },
    boxStyle: {
        height: hp(100),
        width: wp(100),
        borderRadius: 30,
        alignSelf: 'center',
        backgroundColor: Colors.boxColor,
        alignItems: 'center',
        paddingTop: hp(2),
        marginTop: hp(2)
    },
    signInText: {
        fontSize: 24,
        alignSelf: 'center',
        color: Colors.blackColor,
        marginTop: hp(5),
        fontFamily: Fonts.medium
    },
    TextStyle: {
        fontSize: 14,
        alignSelf: 'center',
        color: Colors.textColor1,
        marginTop: hp(1.50),
        fontFamily: Fonts.regular,
    },
    forgotText: {
        textDecorationLine: 'underline',
        color: Colors.themeColor,
        fontSize: 12,
        fontFamily: Fonts.medium,
    },
    listStyle: {
        height: hp(6),
        width: wp(86.67),
        borderRadius: 5,
        backgroundColor: 'red',
        marginTop: hp(1)
    }

})

export default styles;