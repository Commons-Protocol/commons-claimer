import Image from "next/image";

const Footer = () =>  {

    return (
        <footer style={{ fontSize: "12px", color: "#777777" }} className="flex items-center justify-center py-2">
          <a
            href="https://github.com/Commons-Protocol"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          &nbsp; | &nbsp;
          <a
            href="https://guild.xyz/commons"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guild
          </a>
          &nbsp; | &nbsp;

          <a
            href="https://t.me/+Fuubkcdd3tYzOTE8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
          &nbsp; | &nbsp;

          <a
            href="https://x.com/CommonsOnchain"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          &nbsp; | &nbsp;

          <a
            href="https://app.uniswap.org/explore/tokens/celo/0x7b97031b6297bc8e030b07bd84ce92fea1b00c3e"
            target="_blank"
            rel="noopener noreferrer"
          >
            $COMMONS on Uniswap
            <Image
              style={{ display: "inline-block" }}
              color="#9b9c9e"
              src="/hyperlink.svg"
              alt="Twitter"
              width={32}
              height={32}
            />
          </a>
        </footer>
    )
}

export default Footer;